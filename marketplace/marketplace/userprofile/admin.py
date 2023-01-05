from django.contrib import admin

from userprofile.models import Profile, UserNotification

admin.site.register(UserNotification)


class ProfileAdmin(admin.ModelAdmin):
    list_display = ('owner', 'address', 'verified', 'joined_at', 'last_login', 'email_address', 'email_confirmed', 'twitter', 'insta', 'website')


admin.site.register(Profile, ProfileAdmin)

