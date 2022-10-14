import {auth} from '../../pages/firebase-config'
import {sendEmailVerification} from "firebase/auth";



  export default function SendVerification() {
    return sendEmailVerification(auth.currentUser)
        .then(() => {
            console.log("sending email verification was a success")
        });
  }       


  


