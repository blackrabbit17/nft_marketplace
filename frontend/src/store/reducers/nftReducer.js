import { ActionTypes } from "../constants/actionTypes";

const initialState = {
    exploreNFTs: []
}

export const NFTExploreReducer = (state=initialState, {type, payload}) => {

    switch(type) {

        case ActionTypes.SET_EXPLORE_NFTS:
            return {...state, exploreNFTs: payload};
        default:
            return state;
    }
}