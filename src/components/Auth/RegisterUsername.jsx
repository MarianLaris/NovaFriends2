import {auth} from '../../pages/firebase-config'
import { updateProfile } from "firebase/auth";

export default function RegisterUsername(prop) {
  return updateProfile(auth.currentUser, {
    displayName: prop, photoURL: "https://example.com/jane-q-user/profile.jpg"
  }).then(() => {
   console.log(auth.currentUser.displayName)
  }).catch((error) => {
    // An error occurred
    // ...
  });
}
