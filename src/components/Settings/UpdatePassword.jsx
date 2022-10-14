import {auth} from '../../pages/firebase-config'
import {updatePassword} from "firebase/auth";



  export default function UpdatePassword(prop) {
    updatePassword(auth.currentUser, prop).then(() => {
      console.log(prop)
    }).catch((error) => {
      console.log("failed")
    });
  }

  