from django.conf import settings
import json
from nft.models import NFT
from web3 import Web3


ETH_CONTRACT = '0x0000000000000000000000000000000000000000'
BSC_CONTRACT = '0x0000000000000000000000000000000000000000'
XDAI_CONTRACT = '0x0000000000000000000000000000000000000000'
POLY_CONTRACT = '0x0000000000000000000000000000000000000000'
GANACHE_CONTRACT = '0xF3E76138e32a1c0eC070AB1efcFf70E18c1531cC'


EIP712_DOMAIN_NAME = 'Pactum NFT Marketplace'
EIP712_DOMAIN_VERSION = 1


def erc721_address_for_nft(nft: NFT) -> str:

    contract_mapping = {
        NFT.NETWORK_ETH: Web3.toChecksumAddress(ETH_CONTRACT),
        NFT.NETWORK_BSC: Web3.toChecksumAddress(BSC_CONTRACT),
        NFT.NETWORK_POLY: Web3.toChecksumAddress(POLY_CONTRACT),
        NFT.NETWORK_XDAI: Web3.toChecksumAddress(XDAI_CONTRACT),
        NFT.NETWORK_DEVELOPMENT_EVM: Web3.toChecksumAddress(GANACHE_CONTRACT)
    }

    return contract_mapping[nft.network]

def erc721_abi():

    return json.load(open(str(settings.BASE_DIR / 'artifacts' / 'PactNFT.json')))['abi']
