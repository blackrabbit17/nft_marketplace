"""marketplace URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from nftapi import views as nft_views
from userprofile import views as profile_views
from web.urlwhitelist import whitelisted
from web import views as web_views

urlpatterns = [

    path('admin/', admin.site.urls),

    path('', web_views.home),
    path('api/1.0/NFTCollection/<int:pk>/', nft_views.nft_collection),
    path('api/1.0/NFT/<int:pk>/', nft_views.nft),
    path('api/1.0/NFTProperty/<int:pk>/', nft_views.nft_property),
    path('api/1.0/NFTOffer/<int:pk>/', nft_views.nft_offer),
    path('api/1.0/NFTItemActivity/<int:pk>/', nft_views.nft_itemactivity),
    path('api/1.0/NFTVoucher/<int:pk>/', nft_views.nft_voucher),
    path('api/1.0/NFTFav/<int:pk>/', nft_views.nft_fav),
    path('api/1.0/NFTView/<int:pk>/', nft_views.nft_view),
    
    path('api/1.0/User/Profile/', profile_views.profile),
    path('api/1.0/User/Profile/Update/', profile_views.profile_update),
    path('api/1.0/User/Follow/', profile_views.follow),
    path('api/1.0/User/UserNotification/', profile_views.user_notification),

    path('api/1.0/login_token', web_views.login_token),
    path('api/1.0/logout_token', web_views.logout_token),

    path('api/1.0/web/explore', web_views.explore),
    path('api/1.0/web/news', web_views.news),
    path('api/1.0/web/news/<slug:slug>/', web_views.news_page),
    path('api/1.0/web/topsellers', web_views.top_sellers),
    path('api/1.0/web/newsletter_sub', web_views.newsletter_sub),
    path('api/1.0/web/contract_templates', nft_views.contract_templates),
    path('api/1.0/web/activity_feed', nft_views.activity_feed),
    path('api/1.0/web/NFT/<int:pk>/', web_views.nft),
    path('api/1.0/web/NFT/new/', nft_views.nft_new),
    path('api/1.0/web/security_events/', web_views.security_events),

    path('api/1.0/static/nft_file/<nft_uuid>', web_views.nft_file),
    path('api/1.0/static/nft_img/<nft_uuid>', web_views.nft_img),
    path('api/1.0/static/profile/<img_uuid>', web_views.profile_img)
] + whitelisted
