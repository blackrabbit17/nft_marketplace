import { ActionTypes } from "../constants/actionTypes"

export const setProfile = (profile) => {

    return {
        type: ActionTypes.SET_PROFILE,
        payload: profile
    }

}
