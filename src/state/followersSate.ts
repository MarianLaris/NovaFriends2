import { User } from "../Types/entitinities";

const initialState :User[]=[]


export const  updateFollowersInfo = (state:User[])=>{
   return(
    {
         type:"UPDATE_FOLLOWERS",
         payload:state
      })

}



export const  addFollowersInfo = (state:User)=>{
    return(
     {
          type:"ADD_FOLLOWERS",
          payload:state
       })
 
 }



export const followersReducer = (state = initialState, action:any) => {
    switch (action.type) {
        case "UPDATE_FOLLOWERS":
            return action.payload;
        case "ADD_FOLLOWERS":
            return [...state, action.payload];
        default:
            return state;
    }
}


export const selectFollowers = (state:any) => state.followersReducer;