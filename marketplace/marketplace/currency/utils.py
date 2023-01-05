from currency.eth import IDENT_ETH_NATIVE, ETH_NATIVE_DECIMALS, IDENT_ETH_GANACHE_DEV, ETH_DEV_NATIVE_DECIMALS
from currency.bsc import IDENT_BSC_NATIVE
from currency.poly import IDENT_POLY_NATIVE
from currency.xdai import IDENT_XDAI_NATIVE


def get_symbol_for_currency(currency_id):

    if currency_id == IDENT_ETH_NATIVE:
        return 'ETH'
    elif currency_id == IDENT_BSC_NATIVE:
        return 'BSC'
    elif currency_id == IDENT_POLY_NATIVE:
        return 'POLY'
    elif currency_id == IDENT_XDAI_NATIVE:
        return 'xDAI'
    elif currency_id == IDENT_ETH_GANACHE_DEV:
        return 'ETH'
    else:
        # TODO : Go to the database and find it
        raise Exception('get_symbol_for_currency not yet implemented for currency ' + currency_id)    


def get_decimals_for_currency(currency_id):

    if currency_id == IDENT_ETH_NATIVE:
        return ETH_NATIVE_DECIMALS
    elif currency_id == IDENT_BSC_NATIVE:
        return 18  # TODO : Is the token actually 18 decimals??!
    elif currency_id == IDENT_POLY_NATIVE:
        return 18  # TODO : Is the token actually 18 decimals??!
    elif currency_id == IDENT_XDAI_NATIVE:
        return 18  # TODO : Is the token actually 18 decimals??!
    elif currency_id == IDENT_ETH_GANACHE_DEV:
        return ETH_DEV_NATIVE_DECIMALS
    else:
        # TODO : Go to the database and find it
        raise Exception(f'get_decimals_for_currency not yet implemented for currency: {currency_id}')
