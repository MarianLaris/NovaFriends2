import React, { useEffect } from 'react';
import { IonContent, IonPage, IonButton } from '@ionic/react';
import '../../theme/Login.css';
import { useDispatch } from 'react-redux';
import { updateModalState } from '../../state/loadingModalState';



const Login: React.FC = () => {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(updateModalState({ isOpen: false }))

  }, [])

  return (
    <IonPage>
      <IonContent className="page" fullscreen>
        <div className="page--container">
          <img className="logo" src="assets/images/NovaFriendsWhite.svg" />
          {/* <div className='slogan--container'>
              <h1>Just<br></br> Be <br></br> <span>You</span>.</h1>
            </div> */}
          <IonButton className="login--button one" fill='clear' routerLink="/login">Login</IonButton>
          <IonButton className="login--button two" fill='clear' routerLink="/register">Register!</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login