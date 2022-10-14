import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  useIonRouter,
  IonImg
} from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { chevronBackOutline, cameraOutline } from 'ionicons/icons';
import '../theme/Post.css';

import { useHistory } from 'react-router';
import React, { useEffect, useState } from 'react'
import UIContext from "../Roots/TabsContext";



const CreatePost: React.FC = () => {

  const router = useIonRouter()
  const history = useHistory()
  // photo base64 
  const [photo, setPhoto] = useState<string>("")
  const { setShowTabs } = React.useContext(UIContext);

  useEffect(() => {
    setShowTabs(false);

    return () => {
      setShowTabs(true);
    };
  });

  useEffect(() => {
    const state = history.location.state as { photo: string }
    // get photo from state 
    if (state && state.photo) {
      setPhoto(state.photo)
    }
  }, [])

  const changePhoto = () => {
    Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt
    }).then((photo: any) => {

      if (photo.base64String) {
        setPhoto(`data:image/jpeg;base64,${photo.base64String}`)
      }

    }).catch(console.log)

  }

  return (
    <IonPage>

      {/* NavBar information. Need to add a settings IonButton. */}
      <IonHeader className="post--header">
        <IonToolbar>
          <IonTitle className="notif--header--name">New Post</IonTitle>

          <IonButtons className="home--btn--container" slot="secondary">
            <IonButton onClick={() => router.goBack()} routerDirection="back" color="dark">
              <IonIcon size="large" slot="start" icon={chevronBackOutline} />
            </IonButton>
          </IonButtons>

          <IonButtons className="home--btn--container" slot="primary">
            <IonButton onClick={() => { changePhoto() }} color="dark">
              <IonIcon size="large" slot="end" icon={cameraOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      {/* Initiate the rest of the page content, excluding the bottom tabs. */}
      <IonContent fullscreen>

        {/* Div for an entire post */}
        <div className="new--post--container">
          <div className="picture--container">
            <IonImg src={photo} />
          </div>
          <textarea placeholder='...description' className="new--post--description--text">
          </textarea>
          <IonButton className="new--post--button" fill="clear">Post!</IonButton>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default CreatePost;