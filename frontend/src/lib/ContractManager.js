import {MAINNET_CONTRACT, DEV_CONTRACT, EIP712_DOMAIN_NAME, EIP712_DOMAIN_VERSION} from "../artifacts/ContractConst"

class ContractManager {

    constructor(ethereum) {
        this.ethereum = ethereum;
    }

    eip712Domain = () => {
       
        const CHAIN_ID = parseInt(this.ethereum.chainId);

        var contractAddress;
        if(CHAIN_ID === 1) {
            contractAddress = MAINNET_CONTRACT
        }
        else if(CHAIN_ID === 1337) {
            contractAddress = DEV_CONTRACT;
        }
        else {
            console.error('ContractManager: Unknown chainId:', CHAIN_ID)
        }

        return {
            chainId: CHAIN_ID,
            name: EIP712_DOMAIN_NAME,
            verifyingContract: contractAddress,
            version: EIP712_DOMAIN_VERSION,
        }
    }
}

export default ContractManager;
