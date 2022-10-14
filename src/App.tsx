import { IonApp, IonContent, IonImg, IonModal, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import React, { useEffect } from 'react';

import { auth, db } from './pages/firebase-config'
import { AuthProvider, FirestoreProvider, useSigninCheck } from "reactfire";
import HomeRoot from './Roots/HomeRoot';
import LoginRoot from './Roots/LoginRoot';

// /* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

// /* Theme variables */
import './theme/variables.css';
import { useSelector } from 'react-redux';
import { LoadingModalState, selectModalState } from './state/loadingModalState';
import { checkUpdate } from './components/codePush';


setupIonicReact();

const App: React.FC = () => {
  const modalState: LoadingModalState = useSelector(selectModalState);
  useEffect(() => {
    try {
      checkUpdate()
    } catch (err) {
      alert(err + " update error")
    }
  }, [])

  return (
    <IonApp>
      <AuthProvider sdk={auth}>
        <FirestoreProvider sdk={db}>
          <IonReactRouter>
            <AuthWrapper fallback={<LoginRoot />}>
              <HomeRoot />
            </AuthWrapper>
          </IonReactRouter>
        </FirestoreProvider>
      </AuthProvider>
      <IonModal id="loading-modal" isOpen={modalState.isOpen}   >
        <IonContent className="page" fullscreen>
          <div className="page--container">
            <IonImg className="logo" src="assets/images/NovaFriendsWhite.svg" />
          </div>
        </IonContent>
      </IonModal>
    </IonApp>
  )
};


export const AuthWrapper = ({
  children,
  fallback,
}: React.PropsWithChildren<{ fallback: JSX.Element }>): JSX.Element => {
  const { status, data: signInCheckResult } = useSigninCheck();

  if (!children) {
    throw new Error("Children must be provided");
  }
  if (status === "loading") {
    return <></>
  }
  else if (signInCheckResult.signedIn === true) {

    return children as JSX.Element;
  }


  return fallback;
}

export default App