import { ActionTypes } from "../constants/actionTypes"

export const setExploreNFTs = (nfts) => {

    return {
        type: ActionTypes.SET_EXPLORE_NFTS,
        payload: nfts
    }

}

export const selectNFT = (nft) => {

    return {
        type: ActionTypes.SELECT_NFT,
        payload: nft
    }

}

