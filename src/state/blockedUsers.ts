import { User } from "../Types/entitinities";

const initialState: User[] = []


export const updateBlockedUsersInfo = (state: User[]) => {
    return (
        {
            type: "UPDATE_BLOCKED_USERS",
            payload: state
        })

}



export const addBlockedUsersInfo = (state: User) => {
    return (
        {
            type: "ADD_BLOCKED_USERS",
            payload: state
        })

}



export const BlockedUsersReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case "UPDATE_BLOCKED_USERS": return action.payload;
        case "ADD_BLOCKED_USERS": return [...state, action.payload];
        default:
            return state;
    }
}


export const selectBlockedUsers = (state: any) => state.BlockedUsersReducer;