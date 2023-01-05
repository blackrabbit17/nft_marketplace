import ContractManager from "./ContractManager"

class LazyMinter {

    constructor(ethereum) {
        this.contractManager = new ContractManager(ethereum);
        this.ethereum = ethereum;
    }

    generateVoucherMsg(nft) {

        const msgParams = JSON.stringify({

            domain: this.contractManager.eip712Domain(),

            message: {
                tokenId : nft.id, 
                uri: nft.canonical_uuid, 
                minPrice: nft.price
            },

            primaryType: 'NFTVoucher',
            types: {
                EIP712Domain: [
                    { name: 'name', type: 'string' },
                    { name: 'version', type: 'string' },
                    { name: 'chainId', type: 'uint256' },
                    { name: 'verifyingContract', type: 'address' },
                ],
                NFTVoucher: [
                    {name: "tokenId", type: "uint256"},
                    {name: "minPrice", type: "uint256"},
                    {name: "uri", type: "string"},  
                ]
            },
        });

        return msgParams;
    }
}

export default LazyMinter;