from django.contrib import admin

from nft.models import NFTCollection, NFT, NFTOffer, NFTFav, NFTItemActivity, ContractTemplate, ContractTemplatePlaceholder, ContractVariable, NFTVoucher

admin.site.register(NFTCollection)
admin.site.register(NFTOffer)
admin.site.register(NFTFav)
admin.site.register(NFTItemActivity)
admin.site.register(ContractTemplate)
admin.site.register(ContractVariable)
admin.site.register(NFTVoucher)


class NFTAdmin(admin.ModelAdmin):
    list_display = ('owner', 'title', 'created_at', 'network', 'currency', 'price', 'royalties', 'auction_type')


admin.site.register(NFT, NFTAdmin)


class ContractTemplatePlaceholderAdmin(admin.ModelAdmin):
    list_display = ('contract', 'marker', 'data_type', 'description', 'default_value')


admin.site.register(ContractTemplatePlaceholder, ContractTemplatePlaceholderAdmin)
