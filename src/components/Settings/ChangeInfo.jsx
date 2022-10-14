import {auth} from '../../pages/firebase-config'
import {updateProfile} from "firebase/auth";



function ChangeDisplayName(prop) {
    updateProfile(auth.currentUser, {
      displayName: prop
    }).then(() => {
      console.log("changed username!")
    }).catch((error) => {
    console.log("error!")
    });
}

function ChangeDisplayPic() {
    updateProfile(auth.currentUser, {
      photoURL: "https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=800"
    }).then(() => {
      console.log("change pic successful")
    }).catch((error) => {
      // An error occurred
      // ...
    });
}


export {ChangeDisplayName, ChangeDisplayPic}