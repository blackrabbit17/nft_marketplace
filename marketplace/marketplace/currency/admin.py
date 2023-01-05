from django.contrib import admin

from currency.bsc import BSCERC20
from currency.eth import ETHERC20
from currency.poly import POLYERC20
from currency.xdai import XDAIERC20

admin.site.register(BSCERC20)
admin.site.register(ETHERC20)
admin.site.register(POLYERC20)
admin.site.register(XDAIERC20)
