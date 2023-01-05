from datetime import datetime
import os
from django.contrib.auth.models import User
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.shortcuts import render
from django.http import HttpResponse
import json
import logging
from news.models import NewsPost
from news.serializer import serialize_newspost
from nft.models import NFT, NFTOffer, NFTSale, NFTTransfer, NFTVoucher
from nft.serializer import serialize_nft, serialize_nft_offer, serialize_nft_sale, serialize_nft_transfer, serialize_nft_voucher
from nftapi.response import access_denied, method_not_allowed, obj_found, obj_not_found, response_ok, validation_error
import string
import random
from userprofile.models import Profile, NewsLetterSignup, SecurityEvent
from userprofile.serializer import serialize_profile, serialize_securityevent
from web.asset_utils import find_asset
from web.eth_utils import recover_to_addr
from web.utils import get_client_ip
from web3 import Web3


# This web module contains all of the API views that are not directly "REST" api methods,
# i.e. not concerned with the C.R.U.D operations on individual ORM objects


def home(request):
    return render(request, 'index.html', {})


def whitelisted(request):

    # TODO: One the backend database models for blog posts are implemented
    # we will need to iterate them to make sure the url slug is valid

    return render(request, 'index.html', {})


def login_token(request):

    TOKEN_SESSION = 'login_token'

    if request.method == 'GET':
        token = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for i in range(32))
        request.session[TOKEN_SESSION] = token
        return response_ok(token)

    else:
        token = request.session.get(TOKEN_SESSION)

        if not token:
            return access_denied('You must request a token with a GET request to this url first')

        request_params = json.loads(request.body)
        del request.session[TOKEN_SESSION]

        address = recover_to_addr(token, request_params['signature'])

        if address is None:
            return access_denied('Invalid cryptographic signature')

        if Web3.toChecksumAddress(address) != Web3.toChecksumAddress(request_params['address']):
            return access_denied('Signature not valid for this address')

        try:
            user = User.objects.get(username=Web3.toChecksumAddress(address))
        except User.DoesNotExist:
            user = User.objects.create_user(username=Web3.toChecksumAddress(address))
            user.save()
        
        login(request, user)

        se = SecurityEvent()
        se.owner = request.user
        se.event_type = SecurityEvent.TYPE_LOGIN
        se.remote_ip = get_client_ip(request)
        se.save()

        try:
            profile = Profile.objects.get(owner=user)
        except Profile.DoesNotExist:
            profile = Profile()
            profile.owner = user
            profile.address = Web3.toChecksumAddress(address)

        profile.last_login = datetime.now()
        profile.save()

        return response_ok(serialize_profile(profile))

@login_required
def logout_token(request):

    se = SecurityEvent()
    se.owner = request.user
    se.event_type = SecurityEvent.TYPE_LOGOUT
    se.remote_ip = get_client_ip(request)
    se.save()

    logout(request)

    return response_ok('OK')


@login_required
def security_events(request):
    
    if request.method != 'GET':
        return method_not_allowed()
    
    events = [serialize_securityevent(se) for se in SecurityEvent.objects.filter(owner=request.user).order_by('-created_at')]

    return obj_found(events)


def explore(request):
    if request.method == 'GET':

        nfts = NFT.objects.filter(on_sale=True).order_by('-created_at')

        return response_ok([serialize_nft(nft) for nft in nfts])
    elif request.method == 'POST':

        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return validation_error('Invalid json')

        if 'search' not in body.keys() or 'category' not in body.keys() or 'tradeoption' not in body.keys():
            return validation_error('search, category and tradeoption parameters are all mandatory')
        
        # TODO: This filtering query will need to be django ORM chained filters in future, but
        # cant implement this until we decide the categories

        if body['search'] not in ['', None]:
            return response_ok([serialize_nft(nft) for nft in NFT.objects.filter(title__search=body['search'], on_sale=True).order_by('-created_at')])
        else:
            return response_ok([serialize_nft(nft) for nft in NFT.objects.filter(on_sale=True).order_by('-created_at')])
    else:
        return method_not_allowed()


def news(request):
    if request.method == 'GET':
        payload = [serialize_newspost(np) for np in NewsPost.objects.all().order_by('-created_at')]
        return response_ok(payload)
    else:
        return method_not_allowed()

def news_page(request, slug):

    if request.method == 'GET':
        try:
            np = NewsPost.objects.get(url_slug=slug)
            return response_ok(serialize_newspost(np))
        except NewsPost.DoesNotExist:
            return obj_not_found(f"NewsPost(slug={slug}) does not exist")
    else:
        return method_not_allowed()


def newsletter_sub(request):
    if request.method == 'POST':
        
        try:
            request_params = json.loads(request.body)
        except json.JSONDecodeError:
            return validation_error('Invalid json in request body')

        if 'email' not in request_params.keys():
            return validation_error('Invalid email')

        email = request_params['email']

        if email in ['', None] or '@' not in email:     # Only minimal validation to stop blind posting spambots
            return validation_error('Invalid email')
        
        nws = NewsLetterSignup()
        nws.email_address = email
        nws.save()
        return response_ok('OK')
    else:
        return method_not_allowed()


def nft(request, pk):

    if request.method == 'GET':
        
        try:
            nft = NFT.objects.get(pk=pk)
        except NFT.DoesNotExist:
            return obj_not_found(f"NFT(id={pk}) does not exist")

        offers = [serialize_nft_offer(o) for o in NFTOffer.objects.filter(nft=nft).order_by('-price')]

        history_sales = [serialize_nft_sale(s) for s in NFTSale.objects.filter(nft=nft).order_by('-created_at')]
        history_transfers = [serialize_nft_transfer(t) for t in NFTTransfer.objects.filter(nft=nft).order_by('-created_at')]

        history = sorted(history_sales + history_transfers, key=lambda x: x['created_at'])

        voucher = None
        try:
            voucher = serialize_nft_voucher(NFTVoucher.objects.get(nft=nft))
        except NFTVoucher.DoesNotExist:
            logging.warning(f'NFTVoucher for NFT<id={pk}> does not exist')

        payload = {
            'nft': serialize_nft(nft, check_user_faved=True, user=request.user),
            'offers': offers,
            'history': history,
            'voucher': voucher
        }

        return response_ok(payload)
    else:
        return method_not_allowed()


def top_sellers(request):
    # TODO - Track Sellers
    return response_ok([serialize_profile(prof) for prof in Profile.objects.all()[:12]])


def nft_file(request, nft_uuid):
    pass


def nft_img(request, nft_uuid):

    try:
        return find_asset(settings.UPLOAD_NFT_IMG_FILESYSTEM_LOCATION, nft_uuid)
    except FileNotFoundError:
        return validation_error('Invalid UUID')


def profile_img(request, img_uuid):

    try:
        return find_asset([settings.UPLOAD_PROFILE_FILESYSTEM_LOCATION, ], img_uuid)
    except FileNotFoundError:
        full_path = settings.UPLOAD_ROOT / "unknown_avatar.png"    
        image_data = open(full_path, "rb").read()
        return HttpResponse(image_data, content_type="image/png")
