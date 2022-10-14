import { User } from "../Types/entitinities";

const initialState: User[] = []


export const updateBlockedByInfo = (state: User[]) => {
    return (
        {
            type: "UPDATE_BLOCKED_BY_USERS",
            payload: state
        })

}



// export const addBlockedUsersInfo = (state: User) => {
//     return (
//         {
//             type: "ADD_BLOCKED_USERS",
//             payload: state
//         })

// }



export const
    BlockedByUsersReducer = (state = initialState, action: any) => {
        switch (action.type) {
            case "UPDATE_BLOCKED_BY_USERS": return action.payload;
            default:
                return state;
        }
    }


export const selectBlockedBy = (state: any) => state.BlockedByUsersReducer;