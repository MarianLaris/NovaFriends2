import {auth} from '../../pages/firebase-config'
import {updateEmail} from "firebase/auth";



  export default function UpdateEmail(prop) {
    updateEmail(auth.currentUser, prop).then(() => {
      }).catch((error) => {
        console.log("failed")
      });
  }





