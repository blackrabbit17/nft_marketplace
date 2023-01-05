from nft.models import NFT
import web3


DEFAULT_ETH_RPC = 'http://127.0.0.1:9545/'
DEFAULT_BSC_RPC = 'https://bsc-dataseed1.ninicoin.io/'
DEFAULT_XDAI_RPC = 'https://rpc.xdaichain.com/'
DEFAULT_POLY_RPC = 'https://polygon-rpc.com/'

DEVELOPMENT_RPC = 'http://127.0.0.1:7545/'

def eth_web3_provider():
    return web3.Web3(web3.HTTPProvider(DEFAULT_ETH_RPC))


def bsc_web3_provider():
    return web3.Web3(web3.HTTPProvider(DEFAULT_BSC_RPC))


def xdai_web3_provider():
    return web3.Web3(web3.HTTPProvider(DEFAULT_XDAI_RPC))


def poly_web3_provider():
    return web3.Web3(web3.HTTPProvider(DEFAULT_POLY_RPC))


def development_web3_provider():
    return web3.Web3(web3.HTTPProvider(DEVELOPMENT_RPC))


def get_provider_for_nft(nft: NFT):
    if nft.network == NFT.NETWORK_ETH:
        return eth_web3_provider()
    
    if nft.network == NFT.NETWORK_BSC:
        return bsc_web3_provider()
    
    if nft.network == NFT.NETWORK_XDAI:
        return xdai_web3_provider()
    
    if nft.network == NFT.NETWORK_POLY:
        return poly_web3_provider()
    
    if nft.network == NFT.NETWORK_DEVELOPMENT_EVM:
        return development_web3_provider()

