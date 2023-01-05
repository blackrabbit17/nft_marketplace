from django.db import models


# These are randomly generated placeholders that represent the native token
# this is because ETH itself for example, doesn't have a smart contract,
# They are simply magic numbers used as constants
IDENT_XDAI_NATIVE = 'a6864c'


class XDAIERC20(models.Model):

    address = models.TextField(blank=True, null=True, default=None)

    # Ident is a unique identifier for this particular currency, it matches NFT.currency field
    ident = models.TextField(blank=True, null=True, unique=True)

    symbol = models.TextField(blank=False, null=False)
    name = models.TextField(blank=False, null=False)
    decimals = models.IntegerField(blank=False, null=False)

