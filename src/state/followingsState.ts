import { User } from "../Types/entitinities";

const initialState :User[]=[]


export const  updateFollowingInfo = (state:User[])=>{
   return(
    {
         type:"UPDATE_FOLLOWINGS",
         payload:state
      })

}



export const  addFollowingInfo = (state:User)=>{
    return(
     {
          type:"ADD_FOLLOWINGS",
          payload:state
       })
 
 }



export const followingsReducer = (state = initialState, action:any) => {
    switch (action.type) {
        case "UPDATE_FOLLOWINGS":
            return action.payload;
        case "ADD_FOLLOWINGS":
            return [...state, action.payload];
        default:
            return state;
    }
}


export const selectFollowings = (state:any) => state.followingsReducer;