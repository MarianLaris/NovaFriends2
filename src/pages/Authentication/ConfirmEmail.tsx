import React, { useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
} from "@ionic/react";
import "../../theme/Login.css";
import { auth } from "../firebase-config";
import SendVerification from "../../components/Auth/EmailVerification";

const ConfirmEmail: React.FC = () => {


  useEffect(() => {
    SendVerification()
  }, [])
  

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="notif--header--name">
            Email Verification
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="resend--container">
          <p className="description">
            Email verification sent to: <span>{auth.currentUser?.email}</span>
          </p>

          <p className="description">
            {`Click the link to gain access!`} <span className="spam">{`(Can't find it? Check your spam 🧐)`}</span>
          </p>

          <div className="resend-button-part">
            <IonButton className="resend--button" onClick={SendVerification} fill="clear">
              Resend Email
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ConfirmEmail;
