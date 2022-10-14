// This is an exact copy of the Likes page, but without useContext to hide tabs. This fixes the bug where the main tabs show on Post Large after leaving the likes section.
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, useIonRouter, useIonViewWillEnter, useIonViewWillLeave, IonImg } from '@ionic/react';
import { chevronBackOutline } from 'ionicons/icons';
import '../theme/Notifications-Likes.css';

import React, { useEffect, useState } from 'react'
import UIContext from "../Roots/TabsContext";
import { useHistory } from 'react-router';
import { PostInfo, PostLike, User } from '../Types/entitinities';
import { useSelector } from 'react-redux';
import { selectUser } from '../state/userState';
import { verified } from "../assets/assets"


const LikesPostLarge: React.FC = () => {

  const router = useIonRouter()
  const { setShowTabs } = React.useContext(UIContext);
  const history = useHistory()
  const [likes, setlikes] = useState<PostLike[]>([])
  const [post, setpost] = useState<PostInfo>()
  const user: User = useSelector(selectUser)
  const [verifiedMember, setVerifiedMember] = useState(['bengorski', 'cam']);


  useIonViewWillEnter(() => {
    setShowTabs(false);
  })

  useIonViewWillLeave(() => {
    setShowTabs(true);
  })

  useEffect(() => {
    const state = history.location.state as { post: PostInfo, likes: PostLike[] }
    if (state && state.post && state.likes) {
      setpost(state.post)
      setlikes(state.likes)
    }

  }, [])

  return (
    <IonPage>
      {/* NavBar information. Need to add a settings IonButton. */}
      <IonHeader className="notif--header">
        <IonToolbar>
          <IonTitle className="notif--header--name">Likes
          </IonTitle>
          <IonButtons className="home--btn--container" slot="secondary">
            <IonButton onClick={() => router.goBack()} routerDirection="back" color="dark">
              <IonIcon size="large" slot="start" icon={chevronBackOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      {/* Initiate the rest of the page content, excluding the bottom tabs. */}
      <IonContent fullscreen>

        {/* LIKE styling div */}
        {
          likes.map((like, index) => {
            return (
              <div className="notif--container likes" key={index}>
                <IonImg className="pic--notif likes" src={like.user.photo} />
                <div className="notif--text--container likes">
                  <IonButton onClick={() => { user.email == like.user?.email ? router.push("/profile") : history.push("/UserProfile", { user: like.user }) }} fill="clear" className="username--button likes">
                    <span className="likes--username">@{like.user.username}</span>
                  </IonButton>
                </div>
                {verifiedMember.includes(`${like.user.username}`) ? <img height={15} width={15} src={verified} /> : ''}
              </div>
            )
          })
        }
      </IonContent>
    </IonPage>
  );
};

export default LikesPostLarge;