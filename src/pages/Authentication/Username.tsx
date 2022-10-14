import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonItem, IonLabel, IonList, IonButton} from '@ionic/react';
import '../../theme/Login.css';
import {auth} from '../firebase-config'
import {updateProfile} from "firebase/auth";
import ErrorText from '../../components/ErrorText';



const Username: React.FC = () => {

  const userData = auth.currentUser;
  const [registerUsername, SetRegisterUsername] = useState("")
  const history = useHistory()
  const [error, SetError] = useState("")



  function createUsername() {
    if (userData !== null) {
        updateProfile(userData, {
          displayName: registerUsername, photoURL: "https://example.com/jane-q-user/profile.jpg"
        }).then(() => {
            history.push('/d.home')
        }).catch((error) => {
          // An error occurred
          // ...
        });
      }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Select Username</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        
        <IonList>
          <IonItem>
            <IonLabel position="floating">Username</IonLabel>
            <IonInput onIonChange={e => SetRegisterUsername(e.detail.value!)} />
          </IonItem>
        </IonList>
        <ErrorText error={error} />
        <div className='page--container'>
          <IonButton className="login--button two" onClick={createUsername} fill='clear'>Register</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Username