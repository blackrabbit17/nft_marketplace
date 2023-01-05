import arrow
from currency.utils import get_symbol_for_currency
import logging
from userprofile.models import Profile
from nft.models import NFTCollection, NFT, NFTOffer, NFTFav, NFTItemActivity, ContractTemplate, ContractTemplatePlaceholder, NFTTransfer, NFTSale, NFTVoucher
from userprofile.models import Profile
from userprofile.serializer import serialize_profile
from web3 import Web3


def serialize_nft_voucher(nft_v: NFTVoucher):

    return {'id': nft_v.id,
            'created_at': str(nft_v.created_at),
            'created_at_human': arrow.get(nft_v.created_at).humanize(),
            'data_structure': nft_v.NFTVoucherStruct()}


def serialize_nft_sale(nft_s: NFTSale) -> dict:

    if nft_s is None:
        return None

    source_profile = None
    try:
        source_profile = Profile.objects.get(owner=nft_s.source_owner)
    except Profile.DoesNotExist:
        pass

    target_profile = None
    try:
        target_profile = Profile.objects.get(owner=nft_s.target_owner)
    except Profile.DoesNotExist:
        pass

    return {'id': nft_s.id,
            'source_owner': serialize_profile(source_profile),
            'target_owner': serialize_profile(target_profile),
            'created_at': nft_s.created_at,
            'created_at_human': arrow.get(nft_s.created_at).humanize(),
            'price': nft_s.price,
            'price_formatted': nft_s.get_formatted_amount(),
            'sale_currency_symbol': nft_s.get_offer_currency_symbol(),
            'currency': nft_s.currency,
            'blockchain_tx': nft_s.blockchain_tx,
            'blockchain_status': nft_s.blockchain_status,
            'blockchain_status_human': NFTSale.blockchain_status_human(nft_s.blockchain_status)}


def serialize_nft_transfer(nft_t: NFTTransfer) -> dict:

    if nft_t is None:
        return None
    
    source_profile = None
    try:
        source_profile = Profile.objects.get(owner=nft_t.source_owner)
    except Profile.DoesNotExist:
        pass

    target_profile = None
    try:
        target_profile = Profile.objects.get(owner=nft_t.target_owner)
    except Profile.DoesNotExist:
        pass

    return {'id': nft_t.id,
            'created_at': nft_t.created_at,
            'created_at_human': arrow.get(nft_t.created_at).humanize(),
            'source_owner': serialize_profile(source_profile),
            'target_owner': serialize_profile(target_profile),
            'blockchain_tx': nft_t.blockchain_tx,
            'blockchain_status': nft_t.blockchain_status,
            'blockchain_status_human': NFTTransfer.blockchain_status_human(nft_t.blockchain_status)}


def serialize_contract_template(ct: ContractTemplate, include_placeholders=False) -> dict:

    if ct is None:
        return None

    base_obj = {'id': ct.id,
                'created_at': ct.created_at,
                'name': ct.name}

    if include_placeholders:
        plc = ContractTemplatePlaceholder.objects.filter(contract=ct)
        placeholders = [serialize_contract_template_placeholder(p) for p in plc]

        base_obj['ContractTemplatePlaceholder'] = placeholders

    return base_obj


def serialize_contract_template_placeholder(ctp: ContractTemplatePlaceholder) -> dict:

    if ctp is None:
        return None

    return {'id': ctp.id,
            'contract': serialize_contract_template(ctp.contract),
            'marker': ctp.marker,
            'data_type': ctp.data_type,
            'data_type_human': ctp.data_type_human(),
            'description': ctp.description,
            'default_value': ctp.default_value}



def serialize_nftcollection(nftc: NFTCollection) -> dict:

    if nftc is None:
        return None

    return {'id': nftc.id,
            'created_at': nftc.created_at,
            'description': nftc.description,
            'website': nftc.website,
            'discord': nftc.discord,
            'twitter': nftc.twitter}


def serialize_nft(nft: NFT, check_user_faved=False, user=None) -> dict:

    if nft is None:
        return None

    profile_owner = Profile.objects.get(owner=nft.owner)
    profile_creator = Profile.objects.get(owner=nft.creator)

    auction_end_h = arrow.get(nft.auction_end).humanize() if nft.auction_end is not None else None

    payl = {'id': nft.id,
            'currency': nft.currency,
            'currency_symbol': get_symbol_for_currency(nft.currency),
            'created_at': nft.created_at,
            'network': nft.network,
            'price': nft.price,
            'price_formatted': nft.get_formatted_amount(),
            'auction_type': nft.auction_type,
            'auction_type_human': nft.auction_type_human(),
            'auction_end': nft.auction_end,
            'auction_end_human': auction_end_h,
            'deadline': auction_end_h,  # Legacy
            'canonical_uuid': nft.canonical_uuid,
            'image_preview_url': nft.nft_image_preview_url(),

            'creator_link': '/profile/' + Web3.toChecksumAddress(profile_creator.address),
            'creator_img': profile_creator.profile_image_url(),

            'owner_link': '/profile/' + Web3.toChecksumAddress(profile_creator.address),
            'owner_img': profile_creator.profile_image_url(),

            'owner': serialize_profile(profile_owner),
            'creator': serialize_profile(profile_creator),
            
            'title': nft.title,
            'description': nft.description,
            'likes': nft.likes_count,
            'on_sale': nft.on_sale,
            'pending_itemactivity': serialize_nftitemactivity(nft.pending_itemactivity, include_nft=False),
            'bid_link': '/nft/bid/x'}

    if check_user_faved:
        if user.is_authenticated:
            user_has_fav = NFTFav.objects.filter(nft=nft, user=user).count() > 0
            payl['user_has_fav'] = user_has_fav
        else:
            payl['user_has_fav'] = False
    else:
        payl['user_has_fav'] = False

    return payl


def serialize_nft_offer(nfto: NFTOffer) -> dict:

    if nfto is None:
        return None

    profile = Profile.objects.get(owner=nfto.offered_by)

    return {'id': nfto.id,
            'offered_by': serialize_profile(profile),
            'created_at': nfto.created_at,
            'created_at_human': arrow.get(nfto.created_at).humanize(),
            'currency': nfto.currency,
            'price': nfto.price,
            'price_formatted': nfto.get_formatted_amount(),
            'offer_currency_symbol': nfto.get_offer_currency_symbol()}


def serialize_nftfav(nftfav: NFTFav) -> dict:

    if nftfav is None:
        return None

    return {'id': nftfav.id,
            'nft': serialize_nft(nftfav.nft),
            'profile': serialize_profile(Profile.objects.get(owner=nftfav.user))}


def serialize_nftitemactivity(nft_act: NFTItemActivity, include_nft=True) -> dict:

    if nft_act is None:
        return None

    nft = None
    if include_nft:
        nft = serialize_nft(nft_act.nft) if nft_act.nft is not None else None

    user_from = None
    if nft_act.user_from is not None:
        try:
            profile_from_db = Profile.objects.get(owner=nft_act.user_from)
            user_from = serialize_profile(profile_from_db)
        except Profile.DoesNotExist:
            logging.warn(f"NFTActivity(id={nft_act.id}) with user={nft_act.user_from} tried to load profile but none exists")

    user_to = None
    if nft_act.user_to is not None:
        try:
            profile_from_db = Profile.objects.get(owner=nft_act.user_to)
            user_to = serialize_profile(profile_from_db)
        except Profile.DoesNotExist:
            logging.warn(f"NFTActivity(id={nft_act.id}) with user={nft_act.user_to} tried to load profile but none exists")

    created_at_human = arrow.get(nft_act.created_at).humanize()

    return {'id': nft_act.id,
            'nft': nft,
            'created_at': str(nft_act.created_at),
            'created_at_human': created_at_human,
            'activity_type': nft_act.activity_type,
            'user_from': user_from,
            'user_to': user_to,
            'price': nft_act.price,
            'linked_fav': serialize_nftfav(nft_act.linked_fav),
            'linked_offer': serialize_nft_offer(nft_act.linked_offer),
            'blockchain_tx': nft_act.blockchain_tx,
            'blockchain_tx_status': nft_act.blockchain_tx,
            'blockchain_tx_status_human': nft_act.blockchain_tx_status_human()}
