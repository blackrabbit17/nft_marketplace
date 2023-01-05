from django.urls import path
from web import views as web_views


# This is really annoying.
# 
# So we have to maintain a seperate list of whitelisted
# URLs, whitelisted means they are "front-end" URLs
# for example /support -- URLs that are not connceted 
# to a django view but exist in the react app
# 
# The reason we can't just intercept a 404 and then pass
# the view down to the frontend is because an HTTP 404
# will be interpreted (correctly) as a "NOT FOUND" URL
# by search engine bots
#
# The other aspect is malicious crawlers, if we don't
# respond with a 404 to bots that are scanning for known vulerabilities
# we end up with a ton of bots thinking we have vulerable
# code and generating more and more bad traffic as they try
# to exploit
# 
# There's also not a nice clean way of automating the generation
# of these URLs based on react-route in the frontend code
#
# If there's a better way to do this that doesn't involve
# having to have a whitelist that's maintained in parallel
# to the frontend, OR automataing the generation of this
# that would be awesome! 
#
# - Alain


whitelisted = [
    path('explore/search', web_views.whitelisted),
    path('ranking', web_views.whitelisted),
    path('activity', web_views.whitelisted),
    path('news', web_views.whitelisted),
    path('support', web_views.whitelisted),
    path('contact', web_views.whitelisted),
    path('settings', web_views.whitelisted),
    path('profile/me', web_views.whitelisted),
    path('createNFT', web_views.whitelisted),
]
