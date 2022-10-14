import {auth} from '../../pages/firebase-config'
import {sendPasswordResetEmail} from "firebase/auth";



  export default function ForgotPassword(email) {
    return sendPasswordResetEmail(auth, email)
  }

