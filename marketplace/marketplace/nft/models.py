from decimal import Decimal, InvalidOperation
from inspect import getattr_static
from lib2to3.pgen2.parse import ParseError
import arrow
from currency.eth import IDENT_ETH_GANACHE_DEV, IDENT_ETH_NATIVE
from currency.bsc import IDENT_BSC_NATIVE
from currency.poly import IDENT_POLY_NATIVE
from currency.utils import get_decimals_for_currency, get_symbol_for_currency
from currency.xdai import IDENT_XDAI_NATIVE
from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django_quill.fields import QuillField

import pdfkit
from userprofile.models import Profile
import web3
import uuid


#  ┌──────────┐                            ┌──────────┐
#  |  Minted  ├───────── Expires ─────────►| Expired  |◄─────────────────────────┐
#  └────┬─────┘                            └──────────┘                          |
#       |                                    ▲                                   | Expires
#       |                                    |  Expires                          |
#       |                                    |                                   |
#       |                               ┌───────────┐                        ┌───┴───────┐
#       └──────────── Purchased ───────►| Owned     ├──── Transferred ──────►| Owned     ├──── Transferred ──────► .. n
#                                       |           |                        |           |
#                                       |           ├──── Sold ─────────────►|           ├──── Sold ─────────────► .. n
#                                       └──┬─────┬──┘                        └──┬─────┬──┘ 
#                                          |     |                              |     |              ┌──────────┐
#                                          └─────)───────────── Redeem ─────────┴─────)────────────► | Redeemed |
#                                                |                                    |              └──────────┘
#                                                | Disputed                           | Disputed
#                                                |                                    |              ┌──────────┐
#                                                └────────────────────────────────────┴────────────► | Disputed | ── Resolved, Service Provider ──►
#                                                                                                    |          |
#                                                                                                    |          | ── Resolved, Owner ──►
#                                                                                                    └──────────┘
#  Path                 DB Changes                  Blockchain Changes              Economics
#
#  Path1 -----------------------------------------------------------------------------------------------------------
#     Minted            Create NFT Object           mintNFT()                       Gas paid by service provider
#     Expires           Status: Expired             -                               -

#  Path2 -----------------------------------------------------------------------------------------------------------
#     Minted            Create NFT Object           mintNFT()                       Gas paid by service provider
#     Purchased         Status: Purchased           change owner                    Gas paid by purchaser
#                                                                                   Funds sent to escrow
#     Expires           Status: Expired             -                               Funds may be withdrawn from escrow back to purchaser

#  Path3 -----------------------------------------------------------------------------------------------------------
#     Minted            Create NFT Object           mintNFT()                       Gas paid by service provider
#     Purchased         Status: Purchased           change owner                    Gas paid by purchaser
#                                                                                   Funds sent to escrow
#     Transferred       Change Owner                change owner()                  -
#
#     Redeemed          Status: Redeemed            change_owner()                  Escrowed funds sent to service provider
#                    
#

#  Path4 -----------------------------------------------------------------------------------------------------------
#     Minted            Create NFT Object           mintNFT()                       Gas paid by service provider
#     Purchased         Status: Purchased           change owner                    Gas paid by purchaser
#                                                                                   Funds sent to escrow
#     Sold              Change Owner                change owner()                  Fund % sent to escrow
#
#     Redeemed          Status: Redeemed            change_owner()                  Escrowed funds sent to service provider
#

#  Path5 -----------------------------------------------------------------------------------------------------------
#     Minted            Create NFT Object           mintNFT()                       Gas paid by service provider
#     Purchased         Status: Purchased           change owner                    Gas paid by purchaser
#                                                                                   Funds sent to escrow
#     Sold              Change Owner                change owner()                  Fund % sent to escrow
#
#     Disputed          Status: Disputed            -                               -
#     
#     Evidence uploaded and decided by DAO (or admins)
#
#     Resolved - Service Provider Status: resolved  ?                               Funds sent to service provider


#  Path6 -----------------------------------------------------------------------------------------------------------
#     Minted            Create NFT Object           mintNFT()                       Gas paid by service provider
#     Purchased         Status: Purchased           change owner                    Gas paid by purchaser
#                                                                                   Funds sent to escrow
#     Sold              Change Owner                change owner()                  Fund % sent to escrow
#
#     Disputed          Status: Disputed            -                               -
#     
#     Evidence uploaded and decided by DAO (or admins)
#
#     Resolved - Token Owner: Status resolved ?                                     Funds sent to token owner
#                                                                                   Up to current token price (made from original token price + royalties)
#                                                                                   if current_price > (original price + royalties) then user has shortfall
#                                                                                   if current_price < (original price + royalties) user gets current_price, and remainder sent to DAO trust



class BlockchainStatusMixin:
    BLKCHN_STATUS_PENDING = 0
    BLKCHN_STATUS_SUBMITTED = 1
    BLKCHN_STATUS_CONFIRMED = 2

    BLKCHN_STATUS_OPTIONS = (
        (BLKCHN_STATUS_PENDING, 'Pending'),
        (BLKCHN_STATUS_SUBMITTED, 'Submitted'),
        (BLKCHN_STATUS_CONFIRMED, 'Confirmed')
    )

    @staticmethod
    def blockchain_status_human(code):
        for bl_code, bl_desc in BlockchainStatusMixin.BLKCHN_STATUS_OPTIONS:
            if bl_code == code:
                return bl_desc


class CurrencyFormatterMixin:

    def get_offer_currency_symbol(self):
        return get_symbol_for_currency(self.currency)

    def get_formatted_amount(self, fieldname='price'):
        
        currency = self.currency if self.currency is not None else IDENT_ETH_NATIVE

        return self.price / 10 ** get_decimals_for_currency(currency)


class NFTCollection(models.Model):

    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    description = models.TextField(blank=True, null=True, default=None)

    website = models.TextField(blank=True, null=True, default=None)
    discord = models.TextField(blank=True, null=True, default=None)
    twitter = models.TextField(blank=True, null=True, default=None)


class ContractTemplate(models.Model):
    
    name = models.TextField(blank=False, null=False)
    created_at = models.DateTimeField(blank=False, null=False)
    
    content = QuillField(blank=True, null=True)

    def generate_full_content(self) -> str:
        
        html = self.content.html

        # Make sure all of the contract variables have been supplied
        for placeholder in ContractTemplatePlaceholder.objects.filter(contract=self):
            # This will throw an exception (ContractVariable.DoesNotExist) if it's not found,
            # which we expect the calling code to deal with
            variable = ContractVariable.objects.get(template_placeholder=placeholder)

            if variable.template_placeholder.data_type in [ContractTemplatePlaceholder.DATA_TYPE_STR,
                                                           ContractTemplatePlaceholder.DATA_TYPE_NUMERIC]:

                html = html.replace(placeholder.marker, variable.value_str)
            else:
                # TODO: Put a date formatter here
                # TODO, BONUS POINTS, A date formatter based on the users region or an input selection
                html = html.replace(placeholder.marker, str(variable.value_datetime))

        return html

    def write_pdf(self, output_path):

        stylesheet = settings.BASE_DIR / "nft" / "renderer" / "quill.core.css"

        content = self.generate_full_content()

        pdfkit.from_string('<html class="ql-editor">' + content + '</html>', 
                           output_path,
                           css=stylesheet)
 
    def __str__(self) -> str:
        return f'ContractTemplate(name={self.name})'


class NFT(models.Model, BlockchainStatusMixin, CurrencyFormatterMixin):

    NETWORK_ETH = 1
    NETWORK_BSC = 2
    NETWORK_POLY = 3
    NETWORK_XDAI = 4
    NETWORK_DEVELOPMENT_EVM = 5

    NETWORKS = (
        (NETWORK_ETH, 'Ethereum'),
        (NETWORK_BSC, 'Binance Smart Chain'),
        (NETWORK_POLY, 'Polygon'),
        (NETWORK_XDAI, 'xDai'),
        (NETWORK_DEVELOPMENT_EVM, 'Development EVM')
    )

    AUCTION_TYPE_FIXED_PRICE = 0
    AUCTION_TYPE_TIMED = 1

    AUCTION_TYPES = (
        (AUCTION_TYPE_FIXED_PRICE, 'Fixed Price'),
        (AUCTION_TYPE_TIMED, 'Timed Auction')
    )

    creator = models.ForeignKey(User, related_name='creator', on_delete=models.CASCADE, blank=True, null=True, default=None)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    collection = models.ForeignKey(NFTCollection, on_delete=models.CASCADE, blank=True, null=True)

    title = models.TextField(blank=True, null=True, default=None)
    description = models.TextField(blank=True, null=True, default=None)

    network = models.IntegerField(blank=False, null=False, default=NETWORK_ETH, choices=NETWORKS)
    currency = models.TextField(db_index=True, blank=True, null=True)
    price = models.DecimalField(max_digits=64, decimal_places=0, blank=True, null=True, default=None, db_index=True)
    royalties = models.FloatField(blank=False, null=False, default=0)

    auction_type = models.IntegerField(blank=True, null=True, default=None)
    auction_end = models.BigIntegerField(blank=True, null=True, default=None)

    image_preview = models.TextField(blank=True, null=True, default=None)       # UUID populated by a pre-save hook, see below

    contract_template = models.ForeignKey(ContractTemplate, blank=True, null=True, default=None, on_delete=models.CASCADE)

    likes_count = models.IntegerField(blank=False, null=False, default=0)
    canonical_uuid = models.TextField(blank=True, null=True, default=None, db_index=True)
    pending_itemactivity = models.ForeignKey('NFTItemActivity', related_name='pending_nftitemactivity', blank=True, null=True, default=None, on_delete=models.SET_NULL)

    on_sale = models.BooleanField(blank=False, null=False, default=True)

    def image_preview_filename(self):
        if self.image_preview is None:
            self.image_preview = str(uuid.uuid4())
        
        return str(settings.UPLOAD_NFT_IMG_FILESYSTEM_LOCATION[0]) + '/' + self.image_preview

    def auction_type_human(self):
        for acode, adesc in self.AUCTION_TYPES:
            if self.auction_type == acode:
                return adesc

    def owner_address(self):
        profile = Profile.objects.get(owner=self.owner)
        return web3.Web3.toChecksumAddress(profile.address)

    def nft_image_preview_url(self):
        return settings.UPLOAD_NFT_IMG_URL_ROOT + str(self.image_preview)

    @staticmethod
    def valid_networks():
        all_networks = [NFT.NETWORK_ETH, NFT.NETWORK_BSC, NFT.NETWORK_POLY, NFT.NETWORK_XDAI]

        if settings.CURRENT_ENVIORNMENT != settings.ENV_PRODUCTION:
            all_networks.append(NFT.NETWORK_DEVELOPMENT_EVM)
            
        return all_networks

    @staticmethod
    def currency_id_for_network(network_id):
        if network_id == NFT.NETWORK_ETH:
            return IDENT_ETH_NATIVE
        elif network_id == NFT.NETWORK_BSC:
            return IDENT_BSC_NATIVE
        elif network_id == NFT.NETWORK_POLY:
            return IDENT_POLY_NATIVE
        elif network_id == NFT.NETWORK_XDAI:
            return IDENT_XDAI_NATIVE
        elif network_id == NFT.NETWORK_DEVELOPMENT_EVM:
            return IDENT_ETH_GANACHE_DEV
        else:
            raise ValueError("Unknown network ID : " + str(network_id))


@receiver(pre_save, sender=NFT)
def nft_callback(sender, instance, *args, **kwargs):
    if instance.image_preview is None:
        instance.image_preview = str(uuid.uuid4())

    if instance.canonical_uuid is None:
        instance.canonical_uuid = str(uuid.uuid4())


class NFTCategory(models.Model):
    short_ident = models.TextField(blank=False, null=False, unique=True)
    description = models.TextField(blank=False, null=False)


class NFTInCategory(models.Model):

    nft_category = models.ForeignKey(NFTCategory, blank=False, null=False, on_delete=models.CASCADE)
    nft = models.ForeignKey(NFT, blank=False, null=False, on_delete=models.CASCADE)


class NFTVoucher(models.Model):

    created_at = models.DateTimeField(auto_now_add=True)
    nft = models.ForeignKey(NFT, blank=False, null=False, on_delete=models.CASCADE)

    token_id = models.BigIntegerField(blank=True, null=True, default=None)
    min_price = models.DecimalField(max_digits=64, decimal_places=0, blank=True, null=True, default=None)
    uri = models.TextField(blank=True, null=True, default=None)
    signature = models.TextField(blank=False, null=False)

    def NFTVoucherStruct(self):

        # Must match the NFTVoucher struct in the PactumNFT solidity contract!
        # 
        min_price = int(self.min_price) if self.min_price is not None else None


        return {'tokenId': self.token_id,
                'minPrice': min_price,
                'uri': str(self.uri),
                'signature': str(self.signature)}


class ContractTemplatePlaceholder(models.Model):

    DATA_TYPE_STR = 0
    DATA_TYPE_DATETIME = 1
    DATA_TYPE_NUMERIC = 2

    DATA_TYPES = (
        (DATA_TYPE_STR, 'String'),
        (DATA_TYPE_DATETIME, 'Datetime'),
        (DATA_TYPE_NUMERIC, 'Numeric')
    )

    contract = models.ForeignKey(ContractTemplate, blank=False, null=False, on_delete=models.CASCADE)
    marker = models.TextField(blank=False, null=False)
    data_type = models.IntegerField(blank=False, null=False, choices=DATA_TYPES)
    description = models.TextField(blank=True, null=True, default=None)
    default_value = models.TextField(blank=True, null=True, default=None)

    def data_type_human(self):
        for code, desc in self.DATA_TYPES:
            if code == self.data_type:
                return desc

    def validate(self, input):

        if self.data_type == self.DATA_TYPE_DATETIME:
            try:
                arrow.get(input)
            except arrow.ParserError:
                return False, 'Parse Error on Date, format should be YYYY-mm-dd'

        if self.data_type == self.DATA_TYPE_NUMERIC:
            try:
                Decimal(input)
            except InvalidOperation:
                return False, 'Decimal conversion error'

        return True, None


class ContractVariable(models.Model):

    template_placeholder = models.ForeignKey(ContractTemplatePlaceholder, blank=False, null=False, on_delete=models.CASCADE)
    nft = models.ForeignKey(NFT, blank=False, null=False, on_delete=models.CASCADE)

    value_str = models.TextField(blank=True, null=True, default=None)
    value_datetime = models.DateTimeField(blank=True, null=True, default=None)
    value_numeric = models.DecimalField(max_digits=64, decimal_places=0, blank=True, null=True, default=None)

    def user_value(self, input):

        if self.template_placeholder is None:
            raise ValueError('You must set template_placeholder before assigning values')

        if self.template_placeholder.data_type == ContractTemplatePlaceholder.DATA_TYPE_STR:
            self.value_str = input
        
        if self.template_placeholder.data_type == ContractTemplatePlaceholder.DATA_TYPE_NUMERIC:
            self.value_numeric = input
        
        if self.template_placeholder.data_type == ContractTemplatePlaceholder.DATA_TYPE_DATETIME:
            self.value_datetime = input



class NFTOffer(models.Model, CurrencyFormatterMixin):

    nft = models.ForeignKey(NFT, on_delete=models.CASCADE, db_index=True, blank=False, null=False)
    offered_by = models.ForeignKey(User, blank=True, null=True, default=None, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    price = models.DecimalField(max_digits=64, decimal_places=0)
    currency = models.TextField(db_index=True, blank=True, null=True)


class NFTTransfer(models.Model, BlockchainStatusMixin):

    nft = models.ForeignKey(NFT, on_delete=models.CASCADE, db_index=True, blank=False, null=False)

    source_owner = models.ForeignKey(User, blank=False, null=False, related_name='transfer_source_owner', on_delete=models.CASCADE)
    target_owner = models.ForeignKey(User, blank=False, null=False, related_name='transfer_target_owner', on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)

    blockchain_tx = models.TextField(blank=True, null=True, default=None)
    blockchain_status = models.IntegerField(blank=True, null=True, default=None, choices=BlockchainStatusMixin.BLKCHN_STATUS_OPTIONS)


class NFTSale(models.Model, BlockchainStatusMixin, CurrencyFormatterMixin):

    nft = models.ForeignKey(NFT, on_delete=models.CASCADE, db_index=True, blank=False, null=False)

    source_owner = models.ForeignKey(User, blank=False, null=False, related_name='sale_source_owner', on_delete=models.CASCADE)
    target_owner = models.ForeignKey(User, blank=False, null=False, related_name='sale_target_owner', on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)

    price = models.DecimalField(max_digits=64, decimal_places=0)
    currency = models.TextField(db_index=True, blank=True, null=True)

    blockchain_tx = models.TextField(blank=True, null=True, default=None)
    blockchain_status = models.IntegerField(blank=True, null=True, default=None, choices=BlockchainStatusMixin.BLKCHN_STATUS_OPTIONS)


class NFTFav(models.Model):

    nft = models.ForeignKey(NFT, on_delete=models.CASCADE, db_index=True, blank=False, null=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True, blank=False, null=False)
    faved_at = models.DateTimeField(auto_now_add=True, db_index=True)


class NFTView(models.Model):
    nft = models.ForeignKey(NFT, on_delete=models.CASCADE, db_index=True, blank=False, null=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True, blank=False, null=False)
    viewed_at = models.DateTimeField(auto_now_add=True, db_index=True)


class NFTItemActivity(models.Model, BlockchainStatusMixin):

    ACT_TYPE_MINT = 1
    ACT_TYPE_PURCHASE = 2
    ACT_TYPE_TRANSFER = 3
    ACT_TYPE_OFFER = 4
    ACT_TYPE_FAV = 5
    ACT_TYPE_FOLLOW = 6

    # Note that a "Purchase" is just a lazy mint - i.e. a mint and then
    # a transfer, and it happens in a single transaction

    ACTIVITY_TYPES = (
        (ACT_TYPE_MINT, 'Mint'),
        (ACT_TYPE_PURCHASE, 'Purchase'),
        (ACT_TYPE_TRANSFER, 'Transfer'),
        (ACT_TYPE_OFFER, 'Offer'),
        (ACT_TYPE_FAV, 'Favourite'),
        (ACT_TYPE_FOLLOW, 'Follow')
    )

    created_at = models.DateTimeField(auto_now_add=True)

    nft = models.ForeignKey(NFT, on_delete=models.CASCADE, db_index=True, blank=True, null=True)

    activity_type = models.IntegerField(choices=ACTIVITY_TYPES, blank=False, null=False, db_index=True)

    # Note we have a "wallet_from" and "wallet_to" because addresses
    # may not have a user in our system
    user_from = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='user_from')
    user_to = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='user_to')
    wallet_from = models.TextField(blank=True, null=True, default=None, db_index=True)
    wallet_to = models.TextField(blank=True, null=True, default=None, db_index=True)

    price = models.DecimalField(max_digits=64, decimal_places=0, blank=True, null=True, default=None, db_index=True)

    linked_offer = models.ForeignKey(NFTOffer, blank=True, null=True, default=None, on_delete=models.CASCADE)
    linked_fav = models.ForeignKey(NFTFav, blank=True, null=True, default=None, on_delete=models.CASCADE)

    blockchain_tx = models.TextField(blank=True, null=True, default=None)
    blockchain_tx_status = models.IntegerField(choices=BlockchainStatusMixin.BLKCHN_STATUS_OPTIONS, blank=True, null=True)

    @staticmethod
    def valid_activity_type_codes():
        return [act[0] for act in NFTItemActivity.ACTIVITY_TYPES]

    def activity_type_human(self):
        for st_code, st_desc in self.ACTIVITY_TYPES:
            if st_code == self.activity_type:
                return st_desc

    def blockchain_tx_status_human(self):
        for st_code, st_desc in self.ACTIVITY_TYPES:
            if st_code == self.blockchain_tx_status:
                return st_desc
