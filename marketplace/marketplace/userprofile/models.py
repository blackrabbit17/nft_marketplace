from uuid import uuid4
from django.conf import settings
from django.contrib.auth.models import User
from django.db import models


class Profile(models.Model):

    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    address = models.TextField(blank=False, null=False, db_index=True)
    
    verified = models.BooleanField(default=False)

    joined_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True, default=None)

    username = models.TextField(blank=True, null=True, default=None, unique=True, db_index=True)
    bio = models.TextField(blank=True, null=True)

    email_address = models.TextField(blank=True, null=True, db_index=True)
    email_confirmed = models.BooleanField(default=False)

    twitter = models.TextField(blank=True, null=True, default=None)
    insta = models.TextField(blank=True, null=True, default=None)
    website = models.TextField(blank=True, null=True, default=None)

    profile_image = models.TextField(blank=True, null=True, default=None)
    profile_image_hash = models.TextField(blank=True, null=True, default=None)  # Cache-buster
    profile_banner = models.TextField(blank=True, null=True, default=None)
    profile_banner_hash = models.TextField(blank=True, null=True, default=None) # Cache-buster

    def banner_image_fs_path(self):

        if self.profile_banner is None:
            self.profile_banner = str(uuid4())

        return str(settings.UPLOAD_PROFILE_FILESYSTEM_LOCATION) + '/' + self.profile_banner

    def banner_image_url(self):
        if self.profile_banner_hash is not None:
            return settings.UPLOAD_PROFILE_URL_ROOT + str(self.profile_banner) + '?' + self.profile_banner_hash
        else:
            return settings.UPLOAD_PROFILE_URL_ROOT + str(self.profile_banner)

    def profile_image_fs_path(self):

        if self.profile_image is None:
            self.profile_image = str(uuid4())

        return str(settings.UPLOAD_PROFILE_FILESYSTEM_LOCATION) + '/' + self.profile_image

    def profile_image_url(self):
        if self.profile_image_hash is not None:
            return settings.UPLOAD_PROFILE_URL_ROOT + str(self.profile_image) + '?' + self.profile_image_hash
        else:
            return settings.UPLOAD_PROFILE_URL_ROOT + str(self.profile_image)


class ProfileFollow(models.Model):

    src_profile = models.ForeignKey(Profile, related_name='follow_src_profile', blank=False, null=False, on_delete=models.CASCADE)
    dst_profile = models.ForeignKey(Profile, related_name='follow_dst_profile', blank=False, null=False, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)


class UserNotification(models.Model):

    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    nft_item_activity = models.ForeignKey('nft.NFTItemActivity', blank=True, null=True, default=None, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    dismissed_at = models.DateTimeField(blank=True, null=True, default=None)


class NewsLetterSignup(models.Model):

    created_at = models.DateTimeField(auto_now_add=True)
    email_address = models.TextField(blank=False, null=False, db_index=True)
    remote_ip = models.TextField(blank=True, null=True, db_index=True)


class SecurityEvent(models.Model):

    TYPE_LOGIN = 0
    TYPE_LOGOUT = 1
    TYPE_EMAIL_CHANGE = 2


    EVENT_TYPES = (
        (TYPE_LOGIN, 'Login'),
        (TYPE_LOGOUT, 'Logout'),
        (TYPE_EMAIL_CHANGE, 'Email changed')
    )

    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    event_type = models.IntegerField(blank=False, null=False, choices=EVENT_TYPES)

    remote_ip = models.TextField(blank=True, null=True, default=None)

    meta = models.TextField(blank=True, null=True, default=None)

    def event_type_human(self):
        for code, desc in self.EVENT_TYPES:
            if code == self.event_type:
                return desc

