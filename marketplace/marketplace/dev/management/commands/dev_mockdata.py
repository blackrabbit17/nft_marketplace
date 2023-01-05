from currency.bsc import IDENT_BSC_NATIVE
from currency.eth import IDENT_ETH_NATIVE
from currency.xdai import IDENT_XDAI_NATIVE
from currency.poly import IDENT_POLY_NATIVE

from datetime import date, datetime
from decimal import Decimal

from django.core.management.base import BaseCommand

from django.contrib.auth.models import User

import hashlib

from nft.models import NFT, ContractTemplate, ContractTemplatePlaceholder, ContractVariable, NFTFav, NFTItemActivity, NFTOffer, NFTTransfer, NFTSale
from userprofile.models import Profile, ProfileFollow

from faker import Faker
import random
from pprint import pprint
import string
import time
from web3 import Web3


class Command(BaseCommand):

    def handle(self, *args, **options):

        FAKE_ACCOUNTS = [
            {'address': Web3.toChecksumAddress('0x45a36a8e118C37e4c47eF4Ab827A7C9e579E11E2')},
            {'address': Web3.toChecksumAddress('0xF7EEB523d38AE83C1BD3ADbbCaaBE3cA5fC7B78a')},
            {'address': Web3.toChecksumAddress('0x927E07158B66aFE53dd7CF8CC9D59732b7906AC4')},
            {'address': Web3.toChecksumAddress('0x204B9C787F9c013693f6Ec883CDC4fD209Db20C6')},
            {'address': Web3.toChecksumAddress('0x84b554fE4E77D6c6162bF785433C82a6E56b8B6D')},
            {'address': Web3.toChecksumAddress('0xd53565331A94f14feeca2772A297d627864802B4')},
            {'address': Web3.toChecksumAddress('0xbA4CD55471ff7254042D88bC2A3Ee740DeF0A5cD')}
        ]

        ## Delete the old models
        # 
        addrs = [a['address'] for a in FAKE_ACCOUNTS]
        User.objects.filter(username__in=addrs).delete()

        try:
            ct = ContractTemplate.objects.get(name='Cool contract')
            ct.delete()
        except ContractTemplate.DoesNotExist:
            pass
        
        users = []
        profiles = []

        for acct in FAKE_ACCOUNTS:

            user = User.objects.create_user(username=acct['address'])

            profile = Profile()
            profile.owner = user
            profile.address = Web3.toChecksumAddress(acct['address'])

            if random.random() > 0.2:
                profile.verified = True
            else:
                profile.verified = False
            
            human = Faker()

            if random.random() > 0.5:
                profile.username = human.name()
            
            if random.random() > 0.5:
                profile.bio = human.text()
            
            if random.random() > 0.5:
                profile.email = human.email()
            
            if random.random() > 0.5:
                profile.email_confirmed = True
            
            profile.save()

            users.append(user)
            profiles.append(profile)

            print(profile.address)

        profile_images = [
            '5be254a5-e320-4620-8402-0118fdb60f0f.jpg',
            '626d388e-c240-4659-af26-c95c5c02ae5f.png',
            'a9fcbfe1-5ab2-407e-b499-0718620c7c63.jpg',
            'ea23a4b5-5057-4f7c-b41a-92dd618520ef.jpg',
            'eeb78201-53a1-42af-9823-520bafd3f02b.png',
            'f1201c7b-05e0-4360-af52-c35619367e19.png'
        ]

        for pi in profile_images:
            
            profile = random.choice(profiles)

            profile.profile_image = pi

            hash_md5 = hashlib.md5()
            hash_md5.update(open(profile.profile_image_fs_path(), 'rb').read())
            profile.profile_image_hash = hash_md5.hexdigest()

            profile.save()

            print('Profile image', pi)

        # Now make some NFTs and assign them to the random users
        supported_currencies = [IDENT_BSC_NATIVE, IDENT_ETH_NATIVE, IDENT_XDAI_NATIVE, IDENT_POLY_NATIVE]
        sample_files = ['c8d74d8b-5df4-435c-bdfd-9bb8d6559d0c',
                        '454c443a-079c-4b76-8216-89033f4ece02',
                        '1af0b257-2660-4d6d-ac34-49668eba3970',
                        '9d5a0a2c-e9d6-4543-9576-8326d4d16eaf',
                        '72979fa0-3dda-4d38-904a-4687a832d9c9',
                        '392393ee-cdc2-43e0-b871-5483a490155a']

        nfts = []
        for sf in sample_files:

            new_user = random.choice(users)

            nft = NFT()
            nft.owner = new_user
            nft.network = random.choice(NFT.valid_networks())
            nft.price = random.random() * 10**18
            nft.currency = random.choice(supported_currencies)
            nft.image_preview = sf
            nft.title = 'NFT Title ' + ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(8))
            nft.description = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.'

            if random.random() > 0.5:
                nft.auction_type = NFT.AUCTION_TYPE_FIXED_PRICE
            else:
                nft.auction_type = NFT.AUCTION_TYPE_TIMED
                unix_expiry = time.mktime(datetime.now().timetuple()) + (random.randint(1, 20) * 86400)
                nft.auction_end = unix_expiry

            nft.creator = random.choice(profiles).owner

            nft.save()

            print('nft', ' ', sf, 'Auction type:', nft.auction_type)

            nfts.append(nft)

            nft_item_act = NFTItemActivity()
            nft_item_act.nft = nft
            nft_item_act.activity_type = NFTItemActivity.ACT_TYPE_MINT
            nft_item_act.user_to = new_user
            nft_item_act.save()


        ## Make a sample contract template
        ct = ContractTemplate()
        ct.name = 'Cool contract'
        ct.created_at = datetime.now()
        ct.content.save('{"delta":"{\\"ops\\":[{\\"insert\\":\\"My super cool contract v0.1\\"},{\\"attributes\\":{\\"align\\":\\"center\\",\\"header\\":2},\\"insert\\":\\"\\\\n\\"},{\\"attributes\\":{\\"align\\":\\"center\\"},\\"insert\\":\\"\\\\n\\"},{\\"insert\\":\\"Created at: [datetime]\\\\n\\\\nThis contract officially declares that [name] is the coolest person in the world. With a coolness factor of [numeric].\\\\n\\\\nIt means that Donald Trump has to transfer an amount of [amount] USD to [name] on or before [datetime]\\\\n\\\\n\\"}]}","html":"<h2 class=\\"ql-align-center\\">My super cool contract v0.1</h2><p class=\\"ql-align-center\\"><br></p><p>Created at: [datetime]</p><p><br></p><p>This contract officially declares that [name] is the coolest person in the world. With a coolness factor of [numeric].</p><p><br></p><p>It means that Donald Trump has to transfer an amount of [amount] USD to [name] on or before [datetime]</p><p><br></p>"}')
        ct.save()

        ctp1 = ContractTemplatePlaceholder()
        ctp1.contract = ct
        ctp1.marker = '[name]'
        ctp1.data_type = ContractTemplatePlaceholder.DATA_TYPE_STR
        ctp1.description = 'The name of the human'
        ctp1.save()

        ctp2 = ContractTemplatePlaceholder()
        ctp2.contract = ct
        ctp2.marker = '[numeric]'
        ctp2.data_type = ContractTemplatePlaceholder.DATA_TYPE_NUMERIC
        ctp2.description = 'Generic numeric value'
        ctp2.save()

        ctp3 = ContractTemplatePlaceholder()
        ctp3.contract = ct
        ctp3.marker = '[amount]'
        ctp3.data_type = ContractTemplatePlaceholder.DATA_TYPE_NUMERIC
        ctp3.description = 'The amount of money to be paid'
        ctp3.save()

        ctp4 = ContractTemplatePlaceholder()
        ctp4.contract = ct
        ctp4.marker = '[datetime]'
        ctp4.data_type = ContractTemplatePlaceholder.DATA_TYPE_DATETIME
        ctp4.description = 'Generic Datetime'
        ctp4.save()

        nft = NFT()
        user = random.choice(users)
        nft.owner = user
        nft.creator = user
        nft.network = NFT.NETWORK_ETH
        nft.price = 2 * 10 **18
        nft.currency = IDENT_ETH_NATIVE
        nft.contract_template = ct
        nft.auction_type = NFT.AUCTION_TYPE_FIXED_PRICE
        nft.save()

        nfts.append(nft)

        cv1 = ContractVariable()
        cv1.template_placeholder = ctp1
        cv1.value_str = 'Donald Trump'
        cv1.nft = nft
        cv1.save()

        cv2 = ContractVariable()
        cv2.template_placeholder = ctp2
        cv2.value_str = '1'
        cv2.nft = nft
        cv2.save()

        cv3 = ContractVariable()
        cv3.template_placeholder = ctp3
        cv3.value_str = '100'
        cv3.nft = nft
        cv3.save()

        cv4 = ContractVariable()
        cv4.template_placeholder = ctp4
        cv4.value_datetime = datetime.now()
        cv4.nft = nft
        cv4.save()

        # Now generate some site activity
        # 
        # First, a bunch of favourites

        for _ in range(30):

            rand_user = random.choice(users)
            rand_nft = random.choice(nfts)

            try:
                NFTFav.objects.get(nft=rand_nft, user=rand_user)
            except NFTFav.DoesNotExist:
                nft_fav = NFTFav()
                nft_fav.nft = rand_nft
                nft_fav.user = rand_user
                nft_fav.save()
                print('NFT Fav', nft_fav.user, nft_fav.nft)

                nft_item_act = NFTItemActivity()
                nft_item_act.nft = rand_nft
                nft_item_act.activity_type = NFTItemActivity.ACT_TYPE_FAV
                nft_item_act.user_to = rand_user
                nft_item_act.linked_fav = nft_fav
                nft_item_act.save()

                # Get from DB again because the ones above could be stale
                nft = NFT.objects.get(pk=rand_nft.id)
                nft.likes_count += 1
                nft.save()


            if rand_nft.auction_type == NFT.AUCTION_TYPE_TIMED:
                nft_offer = NFTOffer()
                nft_offer.nft = rand_nft
                nft_offer.offered_by = rand_user

                if random.random() > 0.5:
                    nft_offer.price = nft.price * Decimal(random.random()) + Decimal(1)
                else:
                    nft_offer.price = nft.price * Decimal(random.random()) + Decimal(0.1)

                nft_offer.currency = IDENT_ETH_NATIVE

                nft_offer.save()

                print('NFT Offer on', nft_offer.nft, nft_offer.offered_by, nft_offer.price)

                nft_item_act = NFTItemActivity()
                nft_item_act.nft = rand_nft
                nft_item_act.activity_type = NFTItemActivity.ACT_TYPE_OFFER
                nft_item_act.user_to = rand_user
                nft_item_act.linked_offer = nft_offer
                nft_item_act.save()


        # Now make a bunch of follows

        for _ in range(10):
            rand_src = random.choice(profiles)
            rand_dst = random.choice(profiles)

            if rand_src != rand_dst:

                try:
                    follow = ProfileFollow.objects.get(src_profile=rand_src, dst_profile=rand_dst)
                except ProfileFollow.DoesNotExist:
                    f = ProfileFollow()
                    f.src_profile = rand_src
                    f.dst_profile = rand_dst
                    f.save()
                    print('Follow', f.src_profile, f.dst_profile)

                    item_act = NFTItemActivity()
                    item_act.activity_type = NFTItemActivity.ACT_TYPE_FOLLOW
                    item_act.user_from = rand_src.owner
                    item_act.user_to = rand_dst.owner
                    item_act.save()

                    print('\tNFTActivity FOLLOW', item_act.user_from, item_act.user_to)

        # Now generate a bunch of sales / transfers

        for _ in range(50):

            nft = random.choice(nfts)
            nft = NFT.objects.get(pk=nft.id)

            new_owner = random.choice(users)
            if new_owner == nft.owner:
                continue

            if random.random() > 0.5:
                nft_transfer = NFTTransfer()
                nft_transfer.nft = nft
                nft_transfer.source_owner = nft.owner
                nft_transfer.target_owner = new_owner
                nft_transfer.save()

                nft.owner = new_owner
                nft.save()

                print('Transfer', nft, new_owner)
            else:
                
                nft_sale = NFTSale()
                nft_sale.nft = nft
                nft_sale.currency = nft.currency
                nft_sale.source_owner = nft.owner
                nft_sale.target_owner = new_owner
                nft_sale.price = nft.price * Decimal(1.1)
                nft_sale.currency = nft.currency
                nft_sale.save()

                nft.owner = new_owner
                nft.save()

                print('Sale', nft, new_owner)

        User.objects.create_superuser('admin', 'admin', 'admin')
