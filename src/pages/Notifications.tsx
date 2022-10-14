import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, useIonRouter, useIonToast, IonImg } from '@ionic/react';
import { chevronBackOutline, chevronForward } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import '../theme/Notifications-Likes.css';
import { collection, deleteDoc, doc, getDocs, getFirestore, orderBy, query, setDoc } from 'firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../state/userState';
import { Notification, User } from '../Types/entitinities';
import { updateFollowersInfo } from '../state/followersSate';
import { useHistory } from 'react-router';
import { selectFollowings, updateFollowingInfo } from '../state/followingsState';
import { sendNotification } from '../components/Notifications/notificationConfig';
import { verified } from "../assets/assets"




const Notifications: React.FC = () => {

  const router = useIonRouter()
  const db = getFirestore()
  const user: User = useSelector(selectUser)
  const [notifications, setnotifications] = useState<Notification[]>([])

  // Set button to Follow/Following on click
  const [buttonFollow, setButtonFollow] = useState(true)
  const [buttonFollowStyling, setButtonFollowStyling] = useState(true)



  function declareButtonState() {
    setButtonFollow(!buttonFollow)
    setButtonFollowStyling(!buttonFollowStyling)
  }

  useEffect(() => {

    if (user) {
      getNotifications(user)
    }
  }, [user])

  function getNotifications(user: User) {
    const notifRef = collection(db, 'users/' + user.email + '/notifications');
    getDocs(query(notifRef, orderBy('timestamp', 'desc'))).then((snapshot) => {
      const notifications: Notification[] = []
      snapshot.docs.map(async (docm) => {
        const notif: Notification = docm.data() as Notification
        notifications.push(notif)
        if (!notif.seen) {
          await setDoc(doc(db, 'users/' + user.email + '/notifications', notif.id), { ...notif, seen: true })
        }
      })
      setnotifications(notifications)
    })
  }

  return (
    <IonPage>

      {/* NavBar information. Need to add a settings IonButton. */}
      <IonHeader className="notif--header">
        <IonToolbar>
          <IonTitle className="notif--header--name">Notifications
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

        {
          notifications.map((notification, index) => {
            return <NotificationBlock key={index} notification={notification} />
          })
        }


        {/* 3 Notification Container 3 (Will get deleted when functionality is programmed) */}
        {/* <div className="notif--container">
            <img className="pic--notif" src="assets/images/small-pic.jpeg" />
            <div className="notif--text--container">
                <IonButton onClick={()=>{history.push("/UserProfile",{user:post.user})}} fill="clear" className="username--button">
                    <span className="username--button--span">@bengorski</span>
                </IonButton>
                <p className="text--notif">liked your post</p>
            </div>
        </div> */}


      </IonContent>
    </IonPage>
  );
};


export default Notifications;



export const NotificationBlock: React.FC<{ notification: Notification }> = ({ notification }) => {
  const history = useHistory()
  const user: User = useSelector(selectUser)
  const [verifiedMember, setVerifiedMember] = useState(['bengorski', 'cam']);


  return (

    <div className="notif--container" style={{ background: notification.seen == false ? 'var(--ion-color-light)' : 'white' }} >
      <IonImg className="pic--notif" src={notification.from.photo} />
      <div className="notif--text--container">
        <div className="notif--verified--container">
          <IonButton onClick={() => {
            history.push(user.email !== notification.from.email ? "/UserProfile" : "/profile", { user: notification.from })
          }} fill="clear" className="username--button">
            <span className="username--button--span">@{notification.from.username}</span>
          </IonButton>
          {verifiedMember.includes(`${notification.from.username}`) ? <img height={15} width={15} className="profile--verified" src={verified} /> : ''}
          
        </div>
        <p
          onClick={() => {
            notification.postId && history.push("/post", { postId: notification.postId })
          }}
          className="text--notif">{notification.title}</p>
      </div>
      {notification.postId && <IonButton className="notif--go--to--button" onClick={() => {
        history.push("/post", { postId: notification.postId })
      }}
        fill='clear'>
        <IonIcon icon={chevronForward} />
      </IonButton>}
      {notification.type == "follow" && <UniversalFollowButton className={"button--notif--follow"} appUser={notification.from}></UniversalFollowButton>}
    </div>
  )
}

export const UniversalFollowButton: React.FC<{ appUser: User, className: string, followingClassName?: string }> = ({ appUser, followingClassName, className }) => {
  const user: User = useSelector(selectUser)
  const dispatch = useDispatch()
  const db = getFirestore()
  const [showToast, dissmissToast] = useIonToast()

  // Constants
  const followings: User[] = useSelector(selectFollowings)
  const [followloading, setFollowLoading] = useState(false)
  const [isFollowingUser, setIsFollowingUser] = useState(false)

  useEffect(() => {
    setIsFollowingUser(appUser ? followings.filter(following => following.email === appUser!.email).length > 0 : false);
  }, [followings])

  async function unfollowUser() {
    setFollowLoading(true)
    if (user.email) {
      setFollowLoading(true)
      try {
        if (appUser) {
          await deleteDoc(doc(db, `users/${appUser?.email}/followers/${user.email}`))
          await deleteDoc(doc(db, `users/${appUser?.email}/notifications/${user.email + "following"}`))
          await deleteDoc(doc(db, `users/${user.email}/following/${appUser?.email}`))
          getDocs(collection(db, `users/${user.email}/following`)).then((data) => {
            dispatch(updateFollowingInfo(data.docs.map((doc) => ({ ...doc.data() } as User))));
          })
          getDocs(collection(db, `users/${user.email}/followers`)).then((data) => {
            dispatch(updateFollowersInfo(data.docs.map((doc) => ({ ...doc.data() } as User))));
          })
        }
        showToast(`successfully unfollowed @${appUser!.username}`, 2000);

      } catch (err: any) {
        showToast({ message: err.message, duration: 2000 });

      }
      setFollowLoading(false)
    }
    setFollowLoading(false)
  }

  // Follow user
  async function followUser() {
    if (user.email) {
      setFollowLoading(true)

      try {
        if (appUser) {


          await setDoc(doc(db, `users/${appUser?.email}/followers/${user.email}`), user)
          await setDoc(doc(db, `users/${user.email}/following/${appUser?.email}`), appUser)

          const notification: Notification = {
            from: user,
            title: "started following you",
            type: "follow",
            timestamp: Date.now(),
            id: user.email + "following",
            description: user.username + " started following you",
            postId: "",
            seen: false,

          }
          await setDoc(doc(db, `users/${appUser?.email}/notifications/${notification.id}`), notification)
          await getDocs(collection(db, `users/${user.email}/following`)).then((data) => {
            dispatch(updateFollowingInfo(data.docs.map((doc) => ({ ...doc.data() } as User))));
          }
          )
          await getDocs(collection(db, `users/${user.email}/followers`)).then((data) => {
            dispatch(updateFollowersInfo(data.docs.map((doc) => ({ ...doc.data() } as User))));
          })

          appUser && await sendNotification(notification, `${user.displayName || user.username} ${notification.title}`, appUser)


        }
        showToast(`successfully followed @${appUser!.username}`, 2000);

      } catch (err: any) {
        showToast({ message: err.message, duration: 2000 });

      }
      setFollowLoading(false)
    }
  }

  if (user.email == appUser.email) return <></>

  return (
    <>
      {isFollowingUser ? <IonButton disabled={followloading}
        onClick={() => { unfollowUser() }}
        mode="ios"
        className={`${className} ${followingClassName || "following"}`}
        fill="clear"
      >Following</IonButton> :
        <IonButton
          disabled={followloading}
          onClick={followUser}
          fill="clear"
          className={`${className}`}
        >Follow</IonButton>}
    </>
  )
}