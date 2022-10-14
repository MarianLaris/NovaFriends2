import { User } from "../Types/entitinities";


export const initState:User={
    username: '',
    email: "",
    photo: "",
    followers:0,
    following:0,
    lastSeen:Date.now(),
}


// update user action

export const update_user = (state:User) => {
    return {
        type:"UPDATE_USER",
        payload:state
    }
}



export const userReducer = (state = initState, action:any) => {
    switch (action.type) {
        case 'UPDATE_USER':
            return action.payload;
        default:
            return state;
    }
}


export const selectUser = (state:any) => state.userReducer;

