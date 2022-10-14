import { useState } from "react";
import {
  IonModal,
  IonButton,
  IonContent,
  IonLabel,
  IonInput,
  IonItem,
  IonList,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import ErrorText from "./ErrorText";
import "../theme/Profile-UserProfile.css";

interface InviteModalProps {
  showModal: boolean;
  setShowModal: any;
}

export const InviteModal = (props: InviteModalProps) => {
  const { showModal, setShowModal } = props;
  const [inviteEmail, setInviteEmail] = useState("");
  const [error, SetError] = useState("");

  const onInvite = () => {
    if (error !== "") SetError("");
    if (inviteEmail === null || inviteEmail === "") {
      SetError("Please input invite email.");
    } else {
      //TODO
    }
  };

  const onChangeInviteEmail = (e: any) => {
    if (error !== "") {
      SetError("");
    } else if (e.target.value === null || e.target.value === "") {
      SetError("Please input invite email.");
    }
    setInviteEmail(e.target.value);
  };
  return (
    <IonContent>
      <IonModal isOpen={showModal}>
        <IonHeader>
          <IonToolbar>
            <IonTitle className="notif--header--name">Invite a Friend</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          <IonItem>
            <IonLabel position="floating">Email</IonLabel>
            <IonInput onIonChange={(e) => onChangeInviteEmail(e)} />
            <div className="error--text">
              <ErrorText error={error} />
            </div>
          </IonItem>
        </IonList>
        <IonGrid className="invite-grid">
          <IonRow>
            <IonCol>
              <IonButton color={"light"} onClick={() => setShowModal(false)}>
                Close Modal
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton color={"primary"} onClick={() => onInvite()}>
                Send Invite
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonModal>
    </IonContent>
  );
};
