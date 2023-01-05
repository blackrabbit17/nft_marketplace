from blockchains.deployments.addresses import erc721_address_for_nft, erc721_abi
from blockchains.providers import get_provider_for_nft
from nft.models import NFT


def get_blockchain_owner_of(nft: NFT):

    provider = get_provider_for_nft(nft)
    erc721_contract_addr = erc721_address_for_nft(nft)
    
    contract = provider.eth.contract(address=erc721_contract_addr, abi=erc721_abi())

    owner_addr = contract.functions.ownerOf(nft.id).call()

    return owner_addr
