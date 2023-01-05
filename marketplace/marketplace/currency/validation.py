from currency.bsc import IDENT_BSC_NATIVE
from currency.eth import IDENT_ETH_NATIVE
from currency.poly import IDENT_POLY_NATIVE
from currency.xdai import IDENT_XDAI_NATIVE

from currency.models import *


def is_valid_currency(currency_identifier):

    native_currencies = [IDENT_BSC_NATIVE,
                         IDENT_ETH_NATIVE,
                         IDENT_POLY_NATIVE,
                         IDENT_XDAI_NATIVE]
    
    if currency_identifier in native_currencies:
        return True
    
    # OK, so it's not one of the core currencies, we
    # need to check the database now to see if 
    # it's one of the dynamically supported ERC tokens
    # we can add later

    if BSCERC20.objects.filter(ident=currency_identifier).count() > 0:
        return True

    if ETHERC20.objects.filter(ident=currency_identifier).count() > 0:
        return True
    
    if POLYERC20.objects.filter(ident=currency_identifier).count() > 0:
        return True
    
    if XDAIERC20.objects.filter(ident=currency_identifier).count() > 0:
        return True
    
    return False

