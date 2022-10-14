import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonItem, IonLabel, IonList, IonButton, IonSpinner } from '@ionic/react';
import '../../theme/Login.css';


import { useHistory } from 'react-router-dom';
import { auth } from '../firebase-config'
import { createUserWithEmailAndPassword } from "firebase/auth";
import ErrorText from '../../components/ErrorText';
import { User } from '../../Types/entitinities';
import { setDoc, doc, collection, getDoc, query, where, getDocs, getFirestore, updateDoc, increment } from 'firebase/firestore';

import { useDispatch } from 'react-redux'
import { update_user } from '../../state/userState';

import RegisterUsername from "../../components/Auth/RegisterUsername";
import SendVerification from "../../components/Auth/EmailVerification";
import { generateOTPCode } from './generateCode';
import { Storage } from '@capacitor/storage';
import TermsModal from '../../components/Auth/TermsModal';
import { updateModalState } from '../../state/loadingModalState';



const Register: React.FC = () => {
  const [registerEmail, SetRegisterEmail] = useState("");
  const [routerLink, setRouterLink] = useState("");
  const [registerUsername, SetRegisterUsername] = useState("");
  const [registerPassword, SetRegisterPassword] = useState("");
  const [code, setcode] = useState("");
  const [error, SetError] = useState("");
  const [termsAccepted, settermsAccepted] = useState(false)
  const [showTerms, setshowTerms] = useState(false)
  const [registering, setRegistering] = useState(false);
  const history = useHistory();
  const db = getFirestore()

  // const userReference = collection(db, 'users')
  const dispatch = useDispatch();
  const [loading, setloading] = useState(false);


  useEffect(() => {
    dispatch(updateModalState({ isOpen: false }))

  }, [])
  useEffect(() => {
    Storage.get({ key: 'privacy' }).then((res) => {
      console.log(res.value)
      if (res.value) {
        settermsAccepted(true)
      } else {
        settermsAccepted(false)
      }
    })
  }, [])

  async function Register() {
    setRegistering(true);
    if (error !== "") SetError("");

    const result = await verifyCode();
    if (!result) {
      SetError("Not a valid invite code.")
      setloading(false)
      return
    }

    const usernameResult = await verifyUserName()
    if (!usernameResult) {
      SetError('Invalid user name provided')
      setloading(false)
      return;
    }

    if (!registerEmail) {
      SetError('Invalid email provided')
      setloading(false)
      return;
    }
    if (!registerPassword) {
      SetError('Invalid password provided')
      setloading(false)
      return;
    }

    if (!termsAccepted) {
      setshowTerms(true)
      return;
    } else {
      await Storage.set({ key: 'privacy', value: 'yes' })
      const val = await Storage.get({ key: 'privacy' })


    }
    setloading(true)

    await createUserWithEmailAndPassword(auth, registerEmail, registerPassword)
      .then(async (userCredential) => {


        const user = userCredential.user;
        const userInfo: User = {
          email: registerEmail,
          username: registerUsername,
          photo: "https://firebasestorage.googleapis.com/v0/b/novafriends-3cb8c.appspot.com/o/app%2Favatar.png?alt=media&token=3e9bb81f-f328-4d10-b8b7-1b48e5becb11",
          lastSeen: Date.now(),


        }
        try {
          await setDoc(doc(db, "users", registerEmail), userInfo);
          dispatch(update_user(userInfo))
          RegisterUsername(registerUsername)
          await updateDoc(doc(db, "statistics", 'users'), { count: increment(1) })
          await SendVerification()
          history.push("/confirmemail")


        } catch (error: any) {
          if (error.message) {
            SetError(error.message)
          }
        }
        setloading(false)

      })
      .catch((error) => {
        const errorCode = error.code;
        if (errorCode.includes('auth/weak-password')) {
          SetError("Password must contain at least 6 characters, got it?")
        }
        else if (errorCode.includes('auth/email-already-in-use')) {
          SetError("Email already exists, hombre.")
        }
        else if (errorCode.includes('auth/invalid-email')) {
          SetError("Not a valid email, c'mon man!")
        }
        else {
          SetError('Unable to register user. Pretty please try again.')
        }

        setRegistering(false)
        setloading(false)
      });
  }

  async function verifyCode() {
    if (!code) return false;
    const docRef = doc(db, `invites`, code)
    return getDoc(docRef).then(async (doc) => {
      if (doc.data()) {
        return true;
      }
      else {
        return false
      }
    }).catch((err) => {
      console.log(err)
      return false
    })
  }

  async function verifyUserName() {
    const username = registerUsername
    if (!username) return false;


    try {
      const usernameQuery = query(collection(db, "users"), where("username", "==", username))
      const usernameDocs = (await getDocs(usernameQuery)).docs;
      if (usernameDocs.length > 0) {
        console.log(usernameDocs.map(res => res.data()))
        SetError("Username already taken. try another name, maybe " + username + generateOTPCode().substring(0, 6))
        return false
      }
      else {
        return true
      }
    } catch (err: any) {
      SetError(err.message)


      return false
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="notif--header--name">Register</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel position="floating">Email</IonLabel>
            <IonInput inputMode='email' value={registerEmail} onIonChange={(e) => SetRegisterEmail(e.detail.value!)} />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Username <strong>@</strong></IonLabel>
            <IonInput value={registerUsername} maxlength={15}
              onIonChange={(e) => {
                SetRegisterUsername((e.detail.value!).replace(/\s/g, '').toLowerCase())
              }}
            ></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Password</IonLabel>
            <IonInput
              type='password'
              value={registerPassword}
              onIonChange={(e) => SetRegisterPassword(e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel className="code--label" position="floating" color="tertiary">Invite Code</IonLabel>
            <IonInput value={code} onIonChange={(e) => { setcode(e.detail.value!) }} />
          </IonItem>
        </IonList>
        <div className="error--text">
          <ErrorText error={error} />
        </div>
        <div className='page--container'>
          {loading ? <IonSpinner name="crescent" /> : <IonButton className="login--button register" onClick={Register} fill='clear'>Register!</IonButton>}
          <div className='small--container'>
            <p>or</p>
            <IonButton className="login--button--small" routerLink='/login' routerDirection="root" fill='clear'>Login</IonButton>
          </div>
        </div>
      </IonContent>
      <TermsModal isOpen={showTerms} onDidDismiss={() => { setshowTerms(false); termsAccepted && Register() }} termsAccepted={termsAccepted} settermsAccepted={settermsAccepted} />
    </IonPage>
  );
};

export default Register;