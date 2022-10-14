import {auth} from '../../pages/firebase-config'
import {signOut} from "firebase/auth";



export default function SignOut() {
    signOut(auth.currentUser).then(() => {
      console.log("signout was a success")
    }).catch((error) => {
    });
}