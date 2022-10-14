import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonItem, IonLabel, IonList, IonButton, IonImg, IonModal } from '@ionic/react';
import '../../theme/Login.css';
import { auth, db } from '../firebase-config'
import { signInWithEmailAndPassword } from "firebase/auth";
import ErrorText from '../../components/ErrorText';
import { setDoc, doc } from 'firebase/firestore';
import { User } from '../../Types/entitinities';
import { update_user } from '../../state/userState';
import TermsModal from '../../components/Auth/TermsModal';
import { Storage } from '@capacitor/storage';
import { LoadingModalState, selectModalState, updateModalState } from '../../state/loadingModalState';



const Login: React.FC = () => {

  const [loginEmail, SetLoginEmail] = useState("")
  const [loginPassword, SetLoginPassword] = useState("")
  const [error, SetError] = useState("")
  const [termsAccepted, settermsAccepted] = useState(false)
  const [showTerms, setshowTerms] = useState(false)
  const history = useHistory()
  const dispatch = useDispatch();
  const modalState: LoadingModalState = useSelector(selectModalState)


  useEffect(() => {
    dispatch(updateModalState({ isOpen: false }))

  }, [])

  useEffect(() => {
    Storage.get({ key: 'privacy' }).then((res) => {
      if (res.value) {
        settermsAccepted(true)
      } else {
        settermsAccepted(false)
      }
    })
  }, [])

  async function SignIn() {
    if (error !== '') SetError('');

    if (!loginEmail) {
      SetError('Please provide an Email');
      return
    }
    if (!loginPassword) {
      SetError('Please provide a Password');
      return
    }

    dispatch(updateModalState({ isOpen: true }))


    signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      .then(async (userCredential) => {
        if (userCredential) {
          const userInfo: User = {
            email: userCredential.user.email!,
            username: userCredential.user.displayName || "",
            photo: userCredential.user.photoURL || "",
            lastSeen: Date.now(),
          }

          // await setDoc(doc(db, "users", userInfo.email), userInfo);
          dispatch(update_user(userInfo))
          // setTimeout(() => {
          //   history.push('/home')
          // }, 2000);
        }
      })
      .catch((error) => {
        dispatch(updateModalState({ isOpen: false }))
        if (error.message.match("auth/network-request-failed")) {
          SetError('Network Error. Please try again')
        }
        else {
          SetError('Unable to sign in. Please try again.' + error.message)
        }


      });
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="notif--header--name">Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>


        <IonList>
          <IonItem>
            <IonLabel position="floating">Email</IonLabel>
            <IonInput inputMode='email' onIonChange={e => SetLoginEmail(e.detail.value!)} />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Password</IonLabel>
            <IonInput type='password' onIonChange={e => SetLoginPassword(e.detail.value!)} />
          </IonItem>
        </IonList>




        <div className="error--text">
          <ErrorText error={error} />
        </div>
        <Link className="login--forgot--password" to='/forgotpasswordpage'>Forgot Password?</Link>
        <div className='page--container'>
          <IonButton className="login--button page" onClick={SignIn} fill='clear'>Login</IonButton>
          <div className='small--container page'>
            <p>or</p>
            <IonButton className="login--button--small" routerLink='/register' routerDirection="root" fill='clear'>Register</IonButton>
          </div>
        </div>
      </IonContent>

      <TermsModal isOpen={showTerms} onDidDismiss={() => { setshowTerms(false); termsAccepted && SignIn() }} termsAccepted={termsAccepted} settermsAccepted={settermsAccepted} />
    </IonPage>
  );
};

export default Login