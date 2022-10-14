
import {auth} from '../../pages/firebase-config'
import {deleteUser, reauthenticateWithCredential, updatePassword} from "firebase/auth"; 
import { AuthCredential, EmailAuthCredential, signOut } from "firebase/auth";
import { deleteDoc, getFirestore } from 'firebase/firestore';
 

export default function  changePassword(history, new_password, showPrompt) {
  const db = getFirestore()

    
    const email=auth.currentUser.email
 
    return updatePassword(auth.currentUser,new_password).then(async () => {
        console.log("success")
       
        showPrompt({header:"success", message:"Password changed successfully",buttons:['Ok']})
       
      
        }).catch((error) => {
            showPrompt({header:"Failed", message:error.message,buttons:['Ok']})
        })
   
}