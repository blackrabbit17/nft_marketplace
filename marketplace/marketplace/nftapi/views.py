from ipaddress import v4_int_to_packed
from lib2to3.pgen2.parse import ParseError
from multiprocessing.sharedctypes import Value
from currency.validation import is_valid_currency
from currency.utils import get_decimals_for_currency
from decimal import Decimal, InvalidOperation

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

import json

from nft.models import ContractVariable, NFTCollection, NFT, ContractTemplate, NFTView, NFTVoucher
from nft.serializer import *
from nft.tasks import blockchain_nftitemact_check
from nftapi.response import *

import urllib


@login_required
def nft_voucher(request, pk):

    if request.method == 'GET':
        
        try:
            nft = NFT.objects.get(pk=pk)
        except NFT.DoesNotExist:
            return obj_not_found(f'NFT<id={pk}> does not exist')

        try:
            nft_v = NFTVoucher.objects.get(nft=nft)
        except NFTVoucher.DoesNotExist:
            return obj_not_found('No NFT Voucher for this exists')

        return obj_found(serialize_nft_voucher(nft_v))

    elif request.method == 'POST':
        
        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return validation_error('Invalid json')

        if 'nft' not in body.keys() or 'voucher_signature' not in body.keys():
            return validation_error('Required fields are nft and voucher_signature')

        try:
            nft_id = body['nft']
            nft = NFT.objects.get(pk=nft_id)
        except NFT.DoesNotExist:
            return obj_not_found(f'NFT<id={nft_id}> not found')
        
        if nft.owner != request.user:
            return access_denied('You dont own this NFT')
        
        if NFTVoucher.objects.filter(nft=nft).count() > 0:
            return validation_error('A voucher for this NFT already exists')

        voucher = NFTVoucher()
        voucher.nft = nft
        voucher.signature = body['voucher_signature']
        voucher.min_price = nft.price
        voucher.uri = nft.canonical_uuid
        voucher.token_id = nft.id
        voucher.save()

        return obj_found(serialize_nft_voucher(voucher))

    else:
        return method_not_allowed()


@login_required
def nft_collection(request, pk):

    if request.method == 'GET':
        try:
            db_obj = NFTCollection.objects.get(pk=pk)
            return obj_found(serialize_nftcollection(db_obj))
        except NFTCollection.DoesNotExist:
            return obj_not_found(f'NFTCollection<id={pk}> does not exist')

    elif request.method == 'PATCH':
        pass

    elif request.method == 'POST':
        nftc = NFTCollection()
        nftc.owner = request.user
        for field in ['description', 'website', 'discord', 'twitter']:
            setattr(nftc, field, request.POST.get(field, None))
        nftc.save()
        return obj_found(serialize_nftcollection(nftc))

    elif request.method == 'DELETE':
        try:
            nftc = NFTCollection.objects.get(pk=pk)
        except NFTCollection.DoesNotExist:
            return obj_not_found(f'NFTCollection<id={pk}> does not exist')
        
        if nftc.owner != request.user:
            return access_denied()

        nftc.delete()
        return obj_deleted(f'NFTCollection<id={pk}> deleted')

    else:
        return method_not_allowed()


def contract_templates(request):

    if request.method == 'GET':
        db_objs = ContractTemplate.objects.all().order_by('created_at')
        return obj_found([serialize_contract_template(db_obj, include_placeholders=True) for db_obj in db_objs])
    else:
        return method_not_allowed()


def activity_feed(request):

    if request.method == 'GET':
        db_objs = NFTItemActivity.objects.all().order_by('-created_at')[:100]
        return obj_found([serialize_nftitemactivity(a) for a in db_objs])
    else:
        return method_not_allowed()


@login_required
def nft_new(request):

    if request.method == 'POST':

        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return validation_error('Invalid json')

        nft = NFT()
        nft.creator = request.user
        nft.owner = request.user

        # Validation - Title
        if body['title'] is None or body['title'].strip() == '':
            return validation_error('Title cannot be empty')
        nft.title = body['title']

        # Validation - Description
        nft.description = body['description']

        # Validation - Netowrk
        try:
            network = int(body['network'])
            if network not in NFT.valid_networks():
                raise ValueError()
        except (ValueError, TypeError):
            return validation_error(f'Parameter network:{network} is invalid, allowed values are:' + '[' + ','.join([str(x) for x in NFT.valid_networks()]) + ']')

        nft.network = network

        # Validation - Currency
        if 'currency' not in body['network']:
            nft.currency = NFT.currency_id_for_network(nft.network)
        else:
            if not is_valid_currency(body['currency']):
                return validation_error('Invalid currency')
            else:
                nft.currency = body['currency']

        # Validation - Auction type
        try:
            auction_type = int(body['auctionType'])
            if auction_type not in [0, 1]:
                raise ValueError()
            nft.auction_type = auction_type
        except (ValueError, TypeError):
            return validation_error('Parameter auctionType must be in [0, 1]')

        # Royalties validation
        try:
            royalties = float(body['royalties'])
            if royalties < 0 or royalties > 10:
                raise ValueError

            nft.royalties = royalties
        except ValueError:
            return validation_error('Parameter royalties must be numeric <= 0 <= 10')
        
        # Price validation
        try:
            price = Decimal(body['price'])

            # Now multiply the price by the network decimals, when we do multi-currency support we will have to
            # do a database lookup on the currency (not parsed by frontend yet), to determine the decimals, but for
            # now it's pure tokens from each network
            price = price * 10**get_decimals_for_currency(NFT.currency_id_for_network(network))
        except InvalidOperation:
            return validation_error('Parameter price must be numeric')

        # Contract Template Validation
        # this parameter is optional
        
        contract_variables = []     # django DB objects, have to be saved after nft.save() so the database has a foreigh key

        if body['contractTemplate'] not in ['', None]:
            try:
                template_id = body['contractTemplate']['id']
                ct = ContractTemplate.objects.get(pk=template_id)
                nft.contract_template = ct
            except ContractTemplate.DoesNotExist:
                return validation_error(f'Parameter contractTemplate with id={template_id} does not exist')
            except KeyError:
                return validation_error(f'Parameter contractTemplate must contain an ID')

            # If the contract template is valid, then we must also validate all the placeholders
            ct_placer = body['ctPlaceHolderInput']
            for ctp in ContractTemplatePlaceholder.objects.filter(contract=ct):

                try:
                    user_value = ct_placer[str(ctp.id)]
                except KeyError:
                    return validation_error(f'Contract PlaceHolder(id={ctp.id}) is mandatory but not supplied')
                
                valid, err = ctp.validate(user_value)

                if not valid:
                    return validation_error(f'Contract PlaceHolder(id={ctp.id}) failed validation for value {user_value}, validation error: ' + err)
                
                cv = ContractVariable()
                cv.nft = nft
                cv.template_placeholder = ctp
                cv.user_value(user_value)
                contract_variables.append(cv)

        if auction_type == 0:
            nft.price = price

        if auction_type == 1:
            nft.price = price

            try:
                if body['auctionEndDate'] not in [None, '']:
                    end_date = arrow.get(body['auctionEndDate'])
                    nft.auction_end = end_date.datetime
            except ParseError:
                return validation_error('Date parameters must be in YYYY-mm-dd format')

        nft.save()

        for cv in contract_variables:
            cv.save()

        # Did we get an image?
        if 'imgDataURL' in body.keys() and body['imgDataURL'] not in ['', None]:

            extension = None
            if body['imgDataURL'].startswith('data:image/jpeg;base64,'):
                extension = '.jpg'

            elif body['imgDataURL'].startswith('data:image/png;base64,'):
                extension = '.png'

            elif body['imgDataURL'].startswith('data:image/gif;base64,'):
                extension = '.gif'

            else:
                return validation_error('imgDataURL parameter must be jpg, png or gif')

            response = urllib.request.urlopen(body['imgDataURL'])
            with open(nft.image_preview_filename() + extension, 'wb') as f:
                f.write(response.file.read())


        return response_ok(serialize_nft(nft))
    else:
        return method_not_allowed()


def nft(request, pk):

    if request.method == 'GET':
        try:
            db_obj = NFT.objects.get(pk=pk)
            return obj_found(serialize_nft(db_obj))
        except NFT.DoesNotExist:
            return obj_not_found(f'NFT<id={pk}> does not exist')

    elif request.method == 'PATCH':
        return method_not_allowed()

    elif request.method == 'DELETE':
        try:
            nft = NFT.objects.get(pk=pk)
        except NFT.DoesNotExist:
            return obj_not_found(f'NFT<id={pk}> does not exist')
        
        if nft.owner != request.user:
            return access_denied()

        nft.delete()
        return obj_deleted(f'NFT<id={pk}> deleted')

    else:
        return method_not_allowed()


@login_required
def nft_property(request, pk):

    if request.method == 'GET':
        try:
            db_obj = NFTProperty.objects.get(pk=pk)
            return obj_found(serialize_nft_property(db_obj))
        except NFTProperty.DoesNotExist:
            return obj_not_found(f'NFTProperty<id={pk}> does not exist')

    elif request.method == 'PATCH':
        pass

    elif request.method == 'POST':
        nftp = NFTProperty()
        nftp.owner = request.user

        try:
            nft = NFT.objects.get(pk=request.POST.get('nft'))
            if nft.owner != request.user:
                return access_denied()
            
            nftp.nft = nft
        except NFT.DoesNotExist:
            return obj_not_found(f'NFT<id={pk}> does not exist')
        
        if request.POST.get('prop_name') in ['', None]:
            return validation_error(f'prop_name cannot be an empty string or null')

        for field in ['prop_name', 'prop_value']:
            setattr(nftp, field, request.POST.get(field, None))

        nftp.save()
        return obj_found(serialize_nft_property(nftp))

    elif request.method == 'DELETE':
        try:
            nftp = NFTProperty.objects.get(pk=pk)
        except NFTProperty.DoesNotExist:
            return obj_not_found(f'NFTProperty<id={pk}> does not exist')
        
        if nftp.owner != request.user:
            return access_denied()

        nftp.delete()
        return obj_deleted(f'NFTProperty<id={pk}> deleted')

    else:
        return method_not_allowed()


@login_required
def nft_offer(request, pk):

    if request.method == 'GET':
        try:
            db_obj = NFTOffer.objects.get(pk=pk)
            return obj_found(serialize_nft_offer(db_obj))
        except NFTOffer.DoesNotExist:
            return obj_not_found(f'NFTOffer<id={pk}> does not exist')

    elif request.method == 'PATCH':
        pass

    elif request.method == 'POST':
        
        nfto = NFTOffer()

        try:
            nft = NFT.objects.get(pk=request.POST.get('nft'))
            if nft.owner != request.user:
                return access_denied()
            
            nfto.nft = nft
        except NFT.DoesNotExist:
            return obj_not_found(f'NFT<id={pk}> does not exist')

        # Validation - Expires - TODO: Whats the required validation on this? Is there a maximum amount
        # of time it can be open for? Maybe we bucket it into a set (1 day, 3 days, 20 days) ?

        nft.expires = None

        # Validation - The offer amount
        try:
            price = decimal.Decimal(request.POST.get('price'))
        except decimal.InvalidOperation:
            return validation_error('Parameter price is not a valid decimal')
        
        nft.price = price
        nft.save()

    elif request.method == 'DELETE':
        try:
            nftc = NFTCollection.objects.get(pk=pk)
        except NFTCollection.DoesNotExist:
            return obj_not_found(f'NFTCollection<id={pk}> does not exist')
        
        if nftc.owner != request.user:
            return access_denied()

        nftc.delete()
        return obj_deleted(f'NFTCollection<id={pk}> deleted')

    else:
        return method_not_allowed()



def nft_view(request, pk):

    if not request.user.is_authenticated:
        return response_ok('ok')

    try:
        nft = NFT.objects.get(pk=pk)
    except NFT.DoesNotExist:
        return obj_not_found(f'NFT<id={pk}> does not exist')

    if request.method == 'GET':
        count = NFTView.objects.filter(nft=nft).count()
        return obj_found({'count': count})

    elif request.method == 'POST':
        
        try:
            nv = NFTView.objects.get(nft=nft, user=request.user)
        except NFTView.DoesNotExist:
            nv = NFTView()
            nv.nft = nft
            nv.user = request.user
            nv.save()

        count = NFTView.objects.filter(nft=nft).count()
        return obj_found({'count': count})
    else:
        return method_not_allowed()


@login_required
def nft_fav(request, pk):

    if request.method == 'GET':
        try:
            db_obj = NFTFav.objects.get(pk=pk)
            return obj_found(serialize_nftfav(db_obj))
        except NFTFav.DoesNotExist:
            return obj_not_found(f'NFTFav<id={pk}> does not exist')

    elif request.method == 'POST':
        nft_fav = NFTFav()
        try:
            nft = NFT.objects.get(pk=pk)
            nft_fav.nft = nft
            nft.likes_count += 1  # Denormalized for performance reasons
            nft.save()
        except NFT.DoesNotExist:
            return obj_not_found(f'NFT<id={pk}> does not exist')

        nft_fav.user = request.user
        nft_fav.save()

        return obj_found(serialize_nftfav(nft_fav))


    elif request.method == 'DELETE':
        
        try:
            nft = NFT.objects.get(pk=pk)
        except NFT.DoesNotExist:
            return obj_not_found(f'NFT<id={pk}> does not exist')
        
        try:
            nft_fav = NFTFav.objects.get(nft=nft, user=request.user)
        except NFTFav.DoesNotExist:
            return obj_not_found(f'NFTFav does not exist')
        
        if nft_fav.user != request.user:
            return access_denied()

        nft_fav.delete()

        nft.likes_count -= 1
        nft.save()

        return obj_deleted(f'NFTFav<id={pk}> deleted')

    else:
        return method_not_allowed()


@login_required
def nft_itemactivity(request, pk):

    if request.method == 'GET':
        try:
            db_obj = NFTItemActivity.objects.get(pk=pk)
            return obj_found(serialize_nftitemactivity(db_obj))
        except NFTItemActivity.DoesNotExist:
            return obj_not_found(f'NFTItemActivity<id={pk}> does not exist')

    elif request.method == 'POST':

        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return validation_error('Invalid json')

        required_fields = ['nft', 'activityType', 'blockchainTx']
        for f in required_fields:
            if f not in body.keys():
                return validation_error(f'Field {f} is required')

        nft_id = body['nft']

        try:
            nft = NFT.objects.get(pk=nft_id)
        except NFT.DoesNotExist:
            return validation_error(f'NFT<id={nft_id}> does not exist')

        if body['activityType'] not in NFTItemActivity.valid_activity_type_codes():
            return validation_error('Invalid activity type code')

        it_act = NFTItemActivity()
        it_act.activity_type = body['activityType']
        it_act.nft = nft
        it_act.blockchain_tx = body['blockchainTx']
        it_act.blockchain_tx_status = NFTItemActivity.BLKCHN_STATUS_SUBMITTED
        it_act.save()

        nft.pending_itemactivity = it_act
        nft.save()

        blockchain_nftitemact_check.delay(body['blockchainTx'])

        return obj_found(serialize_nftitemactivity(it_act))


    else:
        return method_not_allowed()
