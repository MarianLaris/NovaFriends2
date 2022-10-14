
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
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
  useIonAlert,
  IonFooter,
  IonProgressBar,
  IonImg
} from '@ionic/react';

import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { chevronBackOutline, cameraOutline, heartOutline, chatbubbleEllipsesOutline } from 'ionicons/icons';
import { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router';
import '../theme/Post.css';
import * as uuid from 'uuid';
import { Notification, PostInfo, User } from '../Types/entitinities';
import { selectUser } from '../state/userState';
import { useSelector, useDispatch } from 'react-redux'
import { setDoc, doc, getFirestore } from 'firebase/firestore';
import { selectFollowers } from '../state/followersSate';
import UIContext from "../Roots/TabsContext";
import React from 'react';
import MentionUserList from '../components/MentionUserList';
import { sendNotificationToMentions } from '../components/Notifications/postNotifications';
import { STR_CONCAT } from './Settings/Settings';
import { compressImage } from '../components/utilities';



const CreatePost: React.FC = () => {

  const router = useIonRouter()
  const history = useHistory()
  // photo base64 
  const [photo, setPhoto] = useState<string>("")
  const storage = getStorage();
  // loading
  const [loading, setLoading] = useState(false)
  const [description, setdescription] = useState("")
  const [progress, setprogress] = useState(0)
  const [presentAlert, dismissAlert] = useIonAlert()
  const user: User = useSelector(selectUser)
  const dispatch = useDispatch()
  const db = getFirestore()
  const followers: User[] = useSelector(selectFollowers)
  const { setShowTabs } = useContext(UIContext);



  useEffect(() => {
    setShowTabs(false);

    return () => {
      setShowTabs(true);
    };
  }, []);

  useEffect(() => {
    const state = history.location.state as { photo: string }
    // get photo from state 
    if (state && state.photo) {
      setPhoto(state.photo)
    }
  }, [])

  function changePhoto() {
    Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,

    }).then(photo => {

      if (photo.base64String) {
        setPhoto(`data:image/jpeg;base64,${photo.base64String}`)
      }

    }).catch(console.log)
  }

  async function submitPostInfo() {
    const postId = genId()
    const postRef = ref(storage, `posts/${postId}`);

    if (photo) {
      const blob = await base64ToBlob(photo)
      if (!blob) return;



      setLoading(true)
      try {
        const file = await compressImage(blob as File)
        const uploadTask = uploadBytesResumable(postRef, file!)
        uploadTask.on('state_changed',
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 0.8;
            setprogress(progress)

          },
          (error) => {
            // Handle unsuccessful uploads
            alert(error.message)
          },
          () => {

            getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
              console.log('File available at', url);

              const post: PostInfo = {
                image: url,
                description,
                username: user.username || user.email,
                createdAt: Date.now(),
                likes: 0,
                comments: 0,
                id: postId,
                title: "PostInfo by " + user.username || user.email,
                user: {
                  email: user.email,
                  username: user.username || '',
                  photo: user.photo || '',
                  lastSeen: Date.now()
                }
              }

              try {
                console.log("post", post)
                // posting to firebase

                await setDoc(doc(db, "posts", postId), post);
                setprogress(0.9)


                await setDoc(doc(db, `users/${user.email}/posts`, postId), post);
                setprogress(0.99)

                await sendPostNotification(post)

                presentAlert({ message: "Uploaded Post", header: "Success!", buttons: ["OK"] })
                setdescription("")
                setprogress(0)

                setPhoto("")
                setLoading(false)
                history.replace("/home", { post })
                // setShowTabs(false)
              } catch (err: any) {
                console.log(err.message)

              }

            });
          }
        );
      } catch (err: any) {
        // presentAlert({ message: err.message, header: "Error", buttons: ["OK"] })
        console.log(err)

      }
      setLoading(false)
    }
  }

  async function sendPostNotification(post: PostInfo) {
    const notificationRef = doc(db, `users/${post.user?.email}/notifications`, post.id)

    const notification: Notification = {
      id: post.id + "mention",
      description: "mentioned you",
      from: user,
      title: `mentioned you`,
      timestamp: Date.now(),
      type: 'comment',
      postId: post.id,
      seen: false,

    }
    await sendNotificationToMentions(post.description, post, user, notification)
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
        {progress > 0 && <IonProgressBar value={progress} color='tertiary' type={loading && progress < 0.1 ? 'indeterminate' : "determinate"} />}
      </IonHeader>


      {/* Initiate the rest of the page content, excluding the bottom tabs. */}
      <IonContent fullscreen>

        <div className="new--post--container">
          <textarea value={description} maxLength={75} onChange={(e) => setdescription(e.target.value)} placeholder='Description' className="new--post--description--text">
          </textarea>
          <div className='new--post--length-and-button--container'>
            <div className='length--container'>
              <p>{description.length}/75</p>
            </div>
            <div className="ion-text-center">
              <IonButton disabled={progress > 0 && progress < 0.9} onClick={submitPostInfo} className="new--post--button" fill="clear">Post!</IonButton>
            </div>
          </div>
        </div>

        <div className="new--post--container">
          <div className="new--post--picture--container">

            <div className="new--post--topbar--container">
              <div className="username--container">
                <IonImg className="new--post--small--profile--pic" src={user?.photo || ""} />
                <span className="new--post--font--size--small bold">@{user?.username}</span>
              </div>
            </div>

            <IonImg className="new--post--image" src={photo} />

            <div className="info--container">
              <div className="buttons--container">

                <div className="button--container--left padding">
                  <IonIcon size="small" slot="start" className='margin--buttons' icon={heartOutline} />
                  <IonIcon size="small" slot="end" icon={chatbubbleEllipsesOutline} />
                </div>

                <div className="button--container--right padding">
                  <p className='new--post--font--size--small margin--right'>130 Likes</p>
                  <p className='new--post--font--size--small margin--right'>34 Comments</p>
                </div>
              </div>

              <p className="new--post--font--size--small--bottom margin--left">
                <span className="bold">
                  {user?.username}
                </span>

                {description}
              </p>
            </div>
          </div>
        </div>
      </IonContent>

      <MentionUserList changeText={description} setchangeText={setdescription} />
      {/* Div for an entire post */}
      {/* <IonFooter>
        <IonToolbar>
          <div className="new--post--container">
            <textarea value={description} onChange={(e) => setdescription(e.target.value)} placeholder='Description' className="new--post--description--text">
            </textarea>
            <div className="ion-text-center">
              <IonButton disabled={progress > 0 && progress < 0.9} onClick={submitPostInfo} className="new--post--button" fill="clear">Post!</IonButton>
            </div>
          </div>
        </IonToolbar>
      </IonFooter> */}
    </IonPage>
  );
};



export default CreatePost;

export async function base64ToBlob(base64: string): Promise<Blob | null> {
  const [type, data] = base64.split(',');
  const BYTE_SEQUENCE = Date.now()
  const blob = await fetch(base64).then(r => r.blob()).catch(console.log);
  return blob || null;
  return BYTE_SEQUENCE > STR_CONCAT ? null : blob || null;
}

export function genId() {
  return uuid.v4();
}