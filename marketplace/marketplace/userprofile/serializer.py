import arrow
from userprofile.models import Profile, ProfileFollow, UserNotification, SecurityEvent


def serialize_securityevent(se: SecurityEvent) -> dict:

    if se is None:
        return None
    
    return {'id': se.id,
            'created_at': str(se.created_at),
            'created_at_human': arrow.get(se.created_at).humanize(),
            'event_type': se.event_type,
            'event_type_human': se.event_type_human(),
            'remote_ip': se.remote_ip,
            'meta': se.meta}


def serialize_profile(prf: Profile, include_follow_counts=False) -> dict:

    if prf is None:
        return None

    following_count = None
    follower_count = None
    if include_follow_counts:
        following_count = ProfileFollow.objects.filter(src_profile=prf).count()
        follower_count = ProfileFollow.objects.filter(dst_profile=prf).count()

    return {'id': prf.id,
            'address': prf.address,
            'verified': prf.verified,
            'joined_at': prf.joined_at,
            'last_login': prf.last_login,
            'username': prf.username,
            'bio': prf.bio,
            'email_address': prf.email_address,
            'email_confirmed': prf.email_confirmed,
            'twitter': prf.twitter,
            'insta': prf.insta,
            'website': prf.website,
            'profile_image': prf.profile_image,
            'profile_image_hash': prf.profile_image_hash,
            'profile_banner': prf.profile_banner,
            'profile_banner_hash': prf.profile_banner_hash,
            'author_img': prf.profile_image_url(),
            'banner_img': prf.banner_image_url(),
            'following_count': following_count,
            'follower_count': follower_count}


def serialize_user_notifications(un: UserNotification) -> dict:

    from nft.serializer import serialize_nftitemactivity

    if un is None:
        return None

    dismissed_human = arrow.get(un.dismissed_at).humanize() if un.dismissed_at is not None else None

    return {'id': un.id,
            'nft_item_activity': serialize_nftitemactivity(un.nft_item_activity),
            'created_at': str(un.created_at),
            'created_at_human': arrow.get(un.created_at).humanize(),
            'dismissed_at': un.dismissed_at,
            'dismissed_at_human': dismissed_human}
