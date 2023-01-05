from currency.models import ETHERC20, BSCERC20, POLYERC20, XDAIERC20


def _serialize_erc20_model(model) -> dict:

    return {'id': model.id,
            'address': model.address,
            'symbol': model.symbol,
            'name': model.name,
            'decimals': model.decimals}
    

def serialize_etherc20(c: ETHERC20) -> dict:
    return _serialize_erc20_model(c)


def serialize_bscec20(c: BSCERC20) -> dict:
    return _serialize_erc20_model(c)


def serialize_polyerc20(c: POLYERC20) -> dict:
    return _serialize_erc20_model(c)


def serialize_xdaierc20(c: XDAIERC20) -> dict:
    return _serialize_erc20_model(c)
