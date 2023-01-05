from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
import hashlib
import json
from nft.models import NFT, NFTFav, NFTOffer
from nft.serializer import serialize_nft
from nftapi.response import access_denied, method_not_allowed, obj_found, obj_not_found, response_ok, validation_error
from userprofile.models import Profile, ProfileFollow, SecurityEvent, UserNotification
from userprofile.serializer import serialize_profile, serialize_user_notifications
from web.utils import get_client_ip

import urllib

@login_required
def user_notification(request):

    un = UserNotification.objects.filter(owner=request.user).order_by('-created_at')
    payl = [serialize_user_notifications(u) for u in un]

    return response_ok(payl)


def profile(request):

    if request.method != 'POST':
        return method_not_allowed()

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return validation_error('Invalid json')

    if 'address' not in body.keys():
        return validation_error('Parameter address is required')

    user = None
    profile = None
    user_has_followed = None

    if body['address'] == 'me':

        if not request.user.is_authenticated:
            return validation_error('Cannot request own profile if not logged in')

        try:
            user = request.user
            profile = Profile.objects.get(owner=request.user)
        except Profile.DoesNotExist:
            return obj_not_found('No profile for user')
    else:

        try:
            user = User.objects.get(username=body['address'])
            profile = Profile.objects.get(owner=user)
        except (User.DoesNotExist, Profile.DoesNotExist):
            return obj_not_found('No user with this address found')

        user_has_followed = False
        if request.user.is_authenticated:
            logged_in_user_profile = Profile.objects.get(owner=request.user)

            if ProfileFollow.objects.filter(src_profile=logged_in_user_profile, dst_profile=profile).count() > 0:
                user_has_followed = True
            
    nfts_on_sale = [serialize_nft(n) for n in NFT.objects.filter(owner=user, 
                                                                 on_sale=True).order_by('-created_at')]
    nfts_created = [serialize_nft(n) for n in NFT.objects.filter(creator=user).order_by('-created_at')]
    nfts_owned = [serialize_nft(n) for n in NFT.objects.filter(owner=user).order_by('-created_at')]
    nfts_favd = [serialize_nft(n.nft) for n in NFTFav.objects.filter(user=user).order_by('-faved_at')]

    payl = {
        'profile': serialize_profile(profile, include_follow_counts=True),
        'nftsOnSale': nfts_on_sale,
        'nftsCreated': nfts_created,
        'nftsOwned': nfts_owned,
        'nftsFavd': nfts_favd,
        'userHasFollowed': user_has_followed
    }

    return response_ok(payl)


@login_required
def profile_update(request):

    if request.method != 'POST':
        return method_not_allowed()

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return validation_error('Invalid json')

    profile = Profile.objects.get(owner=request.user)

    if 'username' in body.keys():

        if body['username'] in ['', None]:
            profile.username = None
        else:
            try:
                existing_profile = Profile.objects.get(username=body['username'])

                if existing_profile.owner == request.user:
                    profile.username = body['username']
                else:
                    return validation_error('Username is already taken')

            except Profile.DoesNotExist:
                profile.username = body['username']

    if 'email' in body.keys():
        if profile.email_address != body['email']:

            se = SecurityEvent()
            se.owner = request.user
            se.event_type = SecurityEvent.TYPE_EMAIL_CHANGE
            se.meta = 'Email changed from ' + str(profile.email_address) + ' to ' + str(body['email'])
            se.remote_ip = get_client_ip(request)
            se.save()

            profile.email_address = body['email']
            profile.email_verified = False
    
    if 'bio' in body.keys():
        profile.bio = body['bio']

    if 'twitter' in body.keys():
        profile.twitter = body['twitter']

    if 'insta' in body.keys():
        profile.insta = body['insta']
    
    if 'website' in body.keys():
        profile.website = body['website']
    
    if 'profile-img' in body.keys():
                
        extension = None
        if body['profile-img'].startswith('data:image/jpeg;base64,'):
            extension = '.jpg'

        elif body['profile-img'].startswith('data:image/png;base64,'):
            extension = '.png'

        elif body['profile-img'].startswith('data:image/gif;base64,'):
            extension = '.gif'

        else:
            return validation_error('profile-img parameter must be jpg, png or gif')

        response = urllib.request.urlopen(body['profile-img'])

        output_filename = profile.profile_image_fs_path() + extension

        print(profile.profile_image_fs_path())
        print('Writing profile image to', output_filename)

        with open(output_filename, 'wb') as f:
            f.write(response.file.read()) 

        hash_md5 = hashlib.md5()
        hash_md5.update(open(output_filename, 'rb').read())
        profile.profile_image_hash = hash_md5.hexdigest()

    if 'banner-img' in body.keys():
                
        extension = None
        if body['banner-img'].startswith('data:image/jpeg;base64,'):
            extension = '.jpg'

        elif body['banner-img'].startswith('data:image/png;base64,'):
            extension = '.png'

        elif body['banner-img'].startswith('data:image/gif;base64,'):
            extension = '.gif'

        else:
            return validation_error('banner-img parameter must be jpg, png or gif')

        response = urllib.request.urlopen(body['banner-img'])
        banner_filename = profile.banner_image_fs_path() + extension
        with open(banner_filename, 'wb') as f:
            f.write(response.file.read()) 

        hash_md5 = hashlib.md5()
        hash_md5.update(open(banner_filename, 'rb').read())
        profile.profile_banner_hash = hash_md5.hexdigest()

    profile.save()

    return obj_found(serialize_profile(profile))

        
@login_required
def follow(request):
    
    if request.method != 'POST':
        return method_not_allowed()
    
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return validation_error('Invalid json')


    dst_address = body['destination']

    try:
        dst_user = User.objects.get(username=dst_address)
        dst_profile = Profile.objects.get(owner=dst_user)

        my_profile = Profile.objects.get(owner=request.user)
    except (User.DoesNotExist, Profile.DoesNotExist):
        return obj_not_found(f'User {dst_address} does not exist')


    if body['method'] == 'FOLLOW':

        follow = ProfileFollow()
        follow.src_profile = my_profile
        follow.dst_profile = dst_profile
        follow.save()

        return response_ok('CREATED')

    elif body['method'] == 'UNFOLLOW':

        try:
            follow = ProfileFollow.objects.get(src_profile=my_profile, dst_profile=dst_profile)
            follow.delete()
            return response_ok('DELETED')
        except ProfileFollow.DoesNotExist():
            return obj_not_found('ProfileFollow does not exist')

    else:
        return validation_error('Error, parameter method must be either FOLLOW or UNFOLLOW')
