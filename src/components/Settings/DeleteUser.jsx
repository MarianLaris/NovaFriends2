import {auth} from '../../pages/firebase-config'
import {deleteUser} from "firebase/auth"; 
import {deleteDoc, getFirestore, doc} from 'firebase/firestore';
 



export default async function DeleteUser(history) {
  const db = getFirestore()

    
    const email=auth.currentUser.email;
   console.log('deleting email');
   await deleteDoc(doc(db,'users',email));
   await deleteUser(auth.currentUser) ;
   console.log("success");
       
        
   
}