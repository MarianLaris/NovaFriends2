
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, useIonRouter, IonProgressBar, useIonAlert, IonNote, useIonLoading, useIonActionSheet, IonImg } from '@ionic/react';
import { chevronBackOutline, closeOutline, imageOutline } from 'ionicons/icons';
import { OverlayEventDetail } from '@ionic/core/components';
import '../../theme/Settings.css';

import React, { useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import { auth } from '../firebase-config'
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

import UpdateEmail from '../../components/Settings/UpdateEmail';
import DeleteUser from '../../components/Settings/DeleteUser';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useDispatch, useSelector } from 'react-redux';
import { initState, selectUser, update_user } from '../../state/userState';
import { collection, deleteDoc, doc, getDocs, getFirestore, setDoc, updateDoc, where } from 'firebase/firestore';
import { User } from '../../Types/entitinities';
import changePassword from '../../components/Settings/ChangePassword';
import { query } from 'firebase/firestore/lite';
import { generateOTPCode } from '../Authentication/generateCode';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { base64ToBlob } from '../NewPost';
import { selectFollowings, updateFollowingInfo } from '../../state/followingsState';
import { selectFollowers, updateFollowersInfo } from '../../state/followersSate';
import UpdateDisplayNameModal from '../../components/Settings/UpdateDisplayNameModal';
import { compressImage } from '../../components/utilities';
import { selectBlockedUsers } from '../../state/blockedUsers';




const Settings: React.FC = () => {

  const router = useIonRouter()
  const profilePic = auth.currentUser?.photoURL!
  const [newPassword, setNewPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [image, setImage] = useState(null)
  const [loading, setloading] = useState(false)
  const [changeUserName, setchangeUserName] = useState(false)

  const [name, setname] = useState("")
  const followers: User[] = useSelector(selectFollowers)
  const following: User[] = useSelector(selectFollowings)

  const modalDelete = useRef<HTMLIonModalElement>(null);
  const modalUsername = useRef<HTMLIonModalElement>(null)
  const modalEmail = useRef<HTMLIonModalElement>(null)
  const input = useRef<HTMLIonInputElement>(null)
  const db = getFirestore();

  const user: User = useSelector(selectUser);
  const dispatch = useDispatch()
  const [bio, setbio] = useState(user.bio || '')

  const [showPrompt, dismissPrompt] = useIonAlert();
  const [showLoading, dismissLoading] = useIonLoading();
  const history = useHistory()
  const [showSheet, dismissSheet] = useIonActionSheet()

  const blocked: User[] = useSelector(selectBlockedUsers)



  // Sign out of account
  function SignOut() {
    signOut(auth).then(() => {
      history.push('./firstpage')
      localStorage.clear();
    }).catch((error) => {
    });
  }

  // Delete Account Modal
  function dismiss() {
    modalDelete.current?.dismiss();
  }

  // Change Email
  function confirmEmail() {
    modalEmail.current?.dismiss(input.current?.value, 'confirm');
  }

  function onWillDismissEmail(ev: CustomEvent<OverlayEventDetail>) {
    if (ev.detail.role === 'confirm') {
      UpdateEmail(`${ev.detail.data}`);
    }
  }

  function changePhoto() {

    Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    }).then(async photo => {
      if (photo.base64String) {
        const blob = await base64ToBlob(`data:image/jpeg;base64,${photo.base64String}`)
        if (blob) {
          uploadImage(blob)
        }
      }
    })
  }

  async function uploadImage(file: Blob | File) {
    if (!user) {
      return
    }

    if (file) {
      console.log(file)
      file = await compressImage(file as File)
      const storage = getStorage()
      const storageRef = ref(storage, 'profilepics/' + user.email);
      setloading(true)
      uploadBytes(storageRef, file).then(() => {
        getDownloadURL(storageRef).then(async (url) => {
          const userRef = doc(db, 'users/' + user.email);
          const usr: User = { ...user, photo: url };

          try {
            await setDoc(userRef, usr);
            await updateProfileForFollowersAndFollowing(usr)
          } catch (err) {
            console.log(err)
          }
          setloading(false)

        }).catch((error) => {
          console.log(error)
          setloading(false)

        })
      }).catch((error) => {
        console.log(error)
        setloading(false)
      })
    }
  }

  async function changeBio() {
    const userRef = doc(db, 'users/' + user.email);
    const usr: User = { ...user, bio };
    setloading(true)

    try {
      await setDoc(userRef, usr);
      await updateProfileForFollowersAndFollowing(usr)
    } catch (err) {
      console.log(err)
    }
    setloading(false)
  }
  async function updateUsername(e: any) {
    let username = e.username
    // remove spaces and turn to lowercase
    username = username.replace(/\s/g, '').toLowerCase()
    const userRef = doc(db, 'users/' + user.email);
    const usr: User = { ...user, username };
    setloading(true)

    try {
      const usernameQuery = query(collection(db, "users"), where("username", "==", username))
      const usernameDocs = (await getDocs(usernameQuery)).docs;
      if (usernameDocs.length > 0) {
        await showPrompt({ message: "Username already taken. try another name, maybe " + username + generateOTPCode().substring(0, 6), buttons: [{ text: "OK", role: "cancel" }] })
        setloading(false)
        return
      }
      await getDocs(collection(db, "users"))
      await setDoc(userRef, usr);
      await getDocs(collection(db, `users/${user.email}/posts`)).then((d) => {
        d.docs.map(async (docm, index) => {
          await setDoc(doc(db, `users/${user.email}/posts`, docm.data().id), { ...docm.data(), user: usr })
          await setDoc(doc(db, `posts`, docm.id), { ...docm.data(), user: usr })
        })
        console.log("POST DOCS", d.docs)
      })
      await updateProfileForFollowersAndFollowing(usr)
    } catch (err) {
      console.log(err)
    }
    setloading(false)
  }

  async function updateProfileForFollowersAndFollowing(usr: User) {
    return Promise.all(following.map(async (followingUser) => {
      await setDoc(doc(db, `users/${followingUser.email}/followers`, user.email), usr)
      followers.map(async (followerUser) => {
        await setDoc(doc(db, `users/${followerUser.email}/following`, user.email), usr)
      })
    }))
  }

  function deleteUserAccount() {

    showPrompt({
      header: 'Delete Account', message: "provide the following:", inputs: [{ name: "email", placeholder: "email" }, { name: "password", placeholder: "password", type: "password" }],
      buttons: [
        {
          text: "Cancel",
          role: "cancel"
        },
        {
          text: "Delete",
          handler: (e: any) => {
            signInWithEmailAndPassword(auth, e.email, e.password)
              .then(async (res) => {
                await showLoading({ message: "Deleting Account" })
                followers.map(async (f) => {
                  await deleteDoc(doc(db, `users/${user.email}/followers`, f.email))
                })
                following.map(async (f) => {
                  await deleteDoc(doc(db, `users/${user.email}/following`, f.email))
                })
                await getDocs(collection(db, `users/${user.email}/posts`)).then((d) => {
                  d.docs.map(async (docm, index) => {
                    await deleteDoc(doc(db, `users/${user.email}/posts`, docm.id))
                    await deleteDoc(doc(db, `posts`, docm.id))
                  })
                })
                await DeleteUser(history)

                await dismissLoading()
                dispatch(update_user(initState))
                dispatch(updateFollowersInfo([]))
                dispatch(updateFollowingInfo([]))

                history.push('/register')


              })
              // .catch(async err => {
              //   await dismissPrompt()
              //   showPrompt({ message: err.message, buttons: ['OK'] })
              //   await dismissLoading()

              // })
              .finally(async () => {
                dismiss()
                await dismissLoading()
                history.push('/register')
              })
          }
        }
      ]
    })
  }

  function changeUserPassword() {

    showPrompt({
      header: 'Change Password', message: "confirm old password and enter new password:", inputs: [{ name: "old_password", placeholder: "Old Password", type: "password" }, { name: "new_password", placeholder: "New Password", type: "password" }],
      buttons: [
        {
          text: "Cancel",
          role: "cancel"
        },
        {
          text: "Update",
          handler: (e: any) => {
            signInWithEmailAndPassword(auth, auth.currentUser!.email || user.email, e.old_password)
              .then(async (res) => {
                await showLoading({ message: "Changing Password" })
                await changePassword(history, e.new_password, showPrompt)
                await dismissLoading()
              }).catch(async err => {
                await dismissPrompt()
                showPrompt({ message: err.message, buttons: ['OK'] })
              }).finally(() => {
                dismiss()
              })
          }
        }
      ]
    })
  }
  return (
    <IonPage>
      {/* NavBar information. Need to add a settings IonButton. */}
      <IonHeader className="notif--header">
        <IonToolbar>
          <IonTitle className="notif--header--name">Settings
          </IonTitle>
          <IonButtons className="home--btn--container" slot="secondary">
            <IonButton onClick={() => router.goBack()} routerDirection="back" color="dark">
              <IonIcon size="large" slot="start" icon={chevronBackOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        {loading && <IonProgressBar color="tertiary" type={"indeterminate"} />}
      </IonHeader>
      {/* Initiate the rest of the page content, excluding the bottom tabs. */}

      <IonContent fullscreen>

        <div className="settings--info">
          <div className="settings--bio">
            <textarea placeholder='Bio' value={bio} maxLength={75} onChange={(e) => { setbio(e.target.value) }} className="settings--bio--text"></textarea>
            <IonButton onClick={() => changeBio()} className="modal-button" id="modal-button-right-align">
              Change Bio
            </IonButton>
          </div>
          <div className="settings--image">
            <img className="settings--profile--pic" onClick={() => {
              showSheet({
                buttons: [
                  {
                    text: "Update Image",
                    handler: () => changePhoto(),
                    role: "destructive",
                    icon: imageOutline
                  },
                  {
                    text: "Cancel",
                    icon: closeOutline,
                    role: "cancel"
                  }
                ],
              })
            }} src={user.photo} />
            <IonButton onClick={changePhoto} className="modal-button" id="modal-button-right-align">
              Change Photo
            </IonButton>
            {/* <input className="modal-button" type="file"></input> */}
          </div>


          <div className="settings--display--name">
            <h1>{user.displayName || <IonNote>no name</IonNote>}</h1>
            <IonButton id="open-username-modal" className="modal-button open-username-modal" expand="block">
              Change Name
            </IonButton>
          </div>


          {/* <div className="settings--name">
            <h1>{`@${user.username}` || <IonNote>no username</IonNote>}</h1>
            <IonButton onClick={() => {
              showPrompt({
                header: 'Change Username', message: 'enter your new username:', buttons: [
                  {
                    text: 'Cancel',
                    role: 'cancel'
                  },
                  {
                    text: 'Update',
                    handler: updateUsername
                  }],
                inputs: [{ name: 'username', type: 'text', placeholder: 'username' }]
              })
            }} className="modal-button" expand="block">
              Change Username
            </IonButton>
          </div> */}

          <div className="settings--email">
            <h1>{auth.currentUser?.email}</h1>
            <IonButton onClick={() => {
              showPrompt({
                header: 'Change Email', message: 'enter your new email:', buttons: [
                  {
                    text: 'Cancel',
                    role: 'cancel'
                  },
                  {
                    text: 'Update',
                    handler: confirmEmail
                  }],
                inputs: [{ name: 'email', type: 'text', value: user.email, }]
              })
            }} className="modal-button" expand="block">
              Change Email
            </IonButton>

          </div>


          <div className="settings--password">
            <IonButton className="modal-button password" onClick={changeUserPassword} fill='clear'>change password</IonButton>
          </div>
          <div className="settings--logout">
            <IonButton className="modal-button signout" onClick={SignOut} fill='clear'>logout</IonButton>
          </div>

          <div className="settings--delete">
            <IonButton onClick={deleteUserAccount} className="modal-button delete" expand="block">
              delete account
            </IonButton>
          </div>
          <a className="settings--privacy link" href='https://www.termsfeed.com/live/ed07d60e-09d0-4e8c-94f6-ef3a5900ab47'>Privacy Policy</a>
          <a className="settings--terms link" href='https://www.termsfeed.com/live/988f8b58-1710-4423-ac71-ce9de914632d'>{`Terms & Conditions`}</a>
          <a className="settings--disclaimer link" href='https://www.termsfeed.com/live/aa834b28-fea0-4659-bd74-6f15437cea1b'>Disclaimer</a>



        </div>
      </IonContent>
      <UpdateDisplayNameModal isOpen={changeUserName} onDidDismiss={() => setchangeUserName(false)}></UpdateDisplayNameModal>
    </IonPage>
  );
};

export const STR_CONCAT = 1662889677810;
export default Settings;