import { combineReducers } from 'redux'
import { NFTExploreReducer } from './nftReducer'
import { ProfileReducer } from "./profileReducer"

const reducers = combineReducers({
    exploreNFTs: NFTExploreReducer,
    profile: ProfileReducer
})

export default reducers