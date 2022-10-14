
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonBadge, useIonActionSheet, useIonLoading, createGesture, Gesture, IonModal, createAnimation, IonImg } from '@ionic/react';
import { heartOutline, cameraOutline } from 'ionicons/icons';
import RenderHomePagePostInfos from '../components/PostSmall'
import '../theme/Home-Discover.css';
import { useState, useEffect, useContext, useRef } from 'react';
import { auth } from './firebase-config'
import { collection, doc, getDocs, getFirestore, query, where } from 'firebase/firestore'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useHistory } from 'react-router';
import { Notification, PostInfo, User } from '../Types/entitinities';
import { selectUser, update_user } from '../state/userState';
import { useDispatch, useSelector } from 'react-redux'
import { selectFollowings, updateFollowingInfo } from '../state/followingsState';
import { onSnapshot } from 'firebase/firestore';
import { updateFollowersInfo } from '../state/followersSate';
import { getStorage } from 'firebase/storage';
import { Capacitor } from '@capacitor/core';
import OneSignal from 'onesignal-cordova-plugin'
import UIContext from "../Roots/TabsContext";
import { selectBlockedUsers, updateBlockedUsersInfo } from '../state/blockedUsers';
import { selectBlockedBy, updateBlockedByInfo } from '../state/blockedByState';
import { Virtuoso } from 'react-virtuoso';
import { updateModalState } from '../state/loadingModalState';
import { CapaciorNativeRun } from '../assets/environment';


const Home: React.FC = () => {
  // Extract values from Firebase
  const [posts, setPostInfos] = useState<PostInfo[]>([])
  const history = useHistory()
  const dispatch = useDispatch()
  const user: User = useSelector(selectUser);
  const db = getFirestore()
  const following: User[] = useSelector(selectFollowings)
  const blockedBy: User[] = useSelector(selectBlockedBy)
  const blocked: User[] = useSelector(selectBlockedUsers)
  const [showSheet, dismissSheet] = useIonActionSheet()
  const [showLoading, dismissLoading] = useIonLoading()
  const [modalItem, setmodalItem] = useState()
  const [openModal, setopenModal] = useState(true)
  const [hidden, sethidden] = useState(true)
  const storage = getStorage()
  const { setShowTabs } = useContext(UIContext);
  const [gesture, setGesture] = useState<Gesture>()
  const contentRef = useRef<HTMLIonContentElement>(null)


  useEffect(() => {
    const el = document.getElementById('home-page');
    let gesture = createGesture({
      el: el!,
      threshold: 0,
      gestureName: 'mgesture',
      gesturePriority: 40.5, // priority of swipe to go back is 40 
      onMove: ev => console.log(ev)
    });
    setGesture(gesture);
    gesture.enable(true);

  }, [])

  useEffect(() => {
    const modal = localStorage.getItem('modal')
    console.log(modal)
    if (modal) {
      const modalItem = (JSON.parse(modal)) as HTMLIonModalElement
      // modalItem.current!.setAttribute('isOpen','false')
      modalItem.toggleAttribute('isOpen')
      localStorage.removeItem('modal')
    }
  }, [])

  useEffect(() => {
    // alert('hey')
    dismissLoading()
    // InitiateNotifications()
    if (Capacitor.isNativePlatform() && user.email) {
      OneSignalInit()
      OneSignal.setExternalUserId(user.email)
    }
    CapaciorNativeRun.PlistCheck(history)
  }, [user]);

  const OneSignalInit = () => {
    OneSignal.setAppId('6499b61f-b5ce-42e5-83aa-3def17d444b0')
    OneSignal.setNotificationOpenedHandler(async (result) => {
      const data: Notification = result.notification.additionalData as Notification
      if (data.postId) {
        history.push('/post', { postId: data.postId });
      }
    });
  }

  const doMediaCapture = async () => {
    // await dismissSheet()
    // let options: VideoCapturePlusOptions = { limit: 1, highquality: true };
    // let capture: any = await VideoCapturePlus.captureVideo(options);
    // let media = capture[0] as MediaFile;

    // // works on android....
    // let resolvedPath: DirectoryEntry;
    // let path = media.fullPath.substring(0, media.fullPath.lastIndexOf("/"));
    // if (Capacitor.getPlatform() === "ios") {
    //   resolvedPath = await File.resolveDirectoryUrl("file://" + path);
    // } else {
    //   resolvedPath = await File.resolveDirectoryUrl(path);
    // }get

    // return File.readAsArrayBuffer(resolvedPath.nativeURL, media.name).then(
    //   (buffer: any) => {
    //     alert(buffer)
    //     // get the buffer and make a blob to be saved
    //     let imgBlob = new Blob([buffer], {
    //       type: media.type,
    //     });
    //     alert(imgBlob);
    //   },
    //   (error: any) => console.log(error)
    // );
  };

  function getPhoto() {
    Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,

    }).then(photo => {
      history.push('/createpost', { photo: `data:image/jpeg;base64,${photo.base64String}` })
    }).catch(console.log)
  }



  useEffect(() => {
    updateUser()
  }, [])

  function getUserData(user: User) {
    let email = user.email
    if (!user) {
      email = auth.currentUser?.email || ""
      if (!email) {
        return;
      }
    }
    const followingCollectionRef = collection(db, `users/${email}/following`)
    const followersCollectionRef = collection(db, `users/${email}/followers`)
    const BlockedCollectionRef = collection(db, `users/${email}/blocked`)
    const blockedByUserCollectionRef = collection(db, `users/${email}/blocked-by`);


    getDocs(followersCollectionRef).then((data) => {
      const followers = data.docs.map((doc) => ({ ...doc.data() } as User))
      dispatch(updateFollowersInfo(followers))

      getDocs(followingCollectionRef).then((data) => {
        const following = data.docs.map((doc) => ({ ...doc.data() } as User))
        dispatch(updateFollowingInfo(following))

        getDocs(BlockedCollectionRef).then((data) => {
          const blocked = data.docs.map((doc) => ({ ...doc.data() } as User))
          dispatch(updateBlockedUsersInfo(blocked))
          dispatch(updateFollowersInfo(followers.filter(f => !blocked.find(usr => usr.email == f.email))))

          getDocs(blockedByUserCollectionRef).then((data) => {
            const blockedby = data.docs.map((doc) => ({ ...doc.data() } as User))
            dispatch(updateBlockedByInfo(blockedby))
            console.log(following, 'following')
            try {
              getPosts({ blocked, blockedBy, following, user })
            } catch (err) {
              alert(err)
            }
          })
        })
      })
    })

  }





  function updateUser() {
    const userRef = doc(db, `users`, auth.currentUser!.email || "")
    onSnapshot(userRef, (data) => {
      const userInfo: User = {
        ...data.data(),
      } as User
      console.log(userInfo, "user")
      dispatch(update_user(userInfo))
      getUserData(userInfo)

    })
  }

  const getPosts = async ({ blocked, blockedBy, following, user }: { blocked: User[], blockedBy: User[], following: User[], user: User }) => {
    // const usersCollectionRef = collection(db, `users/${auth.currentUser?.email}/feed`)
    following = [...following, user]
    const emailOfFollowing: string[] = following.map(f => f.email).filter(em => !(blockedBy.find(usr => usr.email == em))).filter(em => !(blocked.find(usr => usr.email == em)))
    const usersCollectionRef = query(collection(db, `posts`))
    onSnapshot(usersCollectionRef, (data) => {
      const results = data.docs.map((doc) => ({ ...doc.data(), id: doc.id } as PostInfo))
      const wanted_results = results.filter((post) => emailOfFollowing.find(email => email == post.user?.email)).sort((a, b) => b.createdAt - a.createdAt)
      setPostInfos(wanted_results)
      setTimeout(() => {
        setopenModal(false);
        postLoaded && dispatch(updateModalState({ isOpen: false }))

      }, 1000);
    })


    // const max_num = 8;
    // let new_result: PostInfo[] = posts;
    // for (let i = 0; i < emailOfFollowing.length; i += max_num) {
    //   const top10 = emailOfFollowing.filter((em, index) => (index >= i && index < (i + max_num)))

    //   console.log(top10)
    //   const usersCollectionRef = query(collection(db, `posts`), where("user.email", "in", i == 0 ? [...top10, user.email] : top10))
    //   onSnapshot(usersCollectionRef, (data) => {
    //     const results = data.docs.map((doc) => ({ ...doc.data(), id: doc.id } as PostInfo))

    //     results.map((res) => {
    //       if (posts.find((p) => p.id == res.id)) {
    //         const index = posts.findIndex((p) => p.id == res.id)
    //         new_result[index] = results[index]
    //       } else {
    //         new_result = [...new_result, res]
    //       }

    //     })

    //     posts.map((res, index) => {
    //       if (!results.find((p) => p.id == res.id)) {
    //         new_result.splice(index, 1)
    //       }
    //     })
    //     new_result = new_result.filter((result, index) => (new_result.findIndex((p) => p.id == result.id) == index))

    //     if (posts.length == 0 && i == (emailOfFollowing.length - 1)) {
    //       setPostInfos(new_result.sort((a, b) => b.createdAt - a.createdAt))
    //     } else if (posts.length > 0) {
    //       setTimeout(() => {
    //         setPostInfos(new_result.sort((a, b) => b.createdAt - a.createdAt))
    //       }, 1000);
    //     }
    //     sethidden(false)
    //     setTimeout(() => {
    //       setopenModal(false);
    //       dispatch(updateModalState({ isOpen: false }))
    //       console.log('yeah')
    //       // const modal = document.getElementById('loading-modal')
    //       // modal?.setAttribute('display', 'none')

    //     }, 1000);
    //   })
    // }

  }

  // const getPostInfoTile = <Virtuoso
  //   style={{ height: '100%' }}
  //   totalCount={posts.length}
  //   itemContent={(index) => {
  //     const item = posts[index]
  //     return (
  //       <RenderHomePagePostInfos
  //         key={item.id}
  //         post={item}
  //       />
  //     );
  //   }}
  // />

  const getPostInfoTile = posts.map((item) => {
    return (
      <RenderHomePagePostInfos
        key={item.id}
        post={item}
      />
    );
  }
  )





  // style={{ transition: '0.5s', visibility: hidden ? 'hidden' : 'visible' }}

  return (
    <IonPage id='home-page'>
      {/* NavBar Section */}
      <IonHeader>
        <IonToolbar>
          <IonTitle className="home--header--name">Home</IonTitle>
          <IonButtons className="home--btn--container" slot="primary">
            <IonButton onClick={() => getPhoto()} color="dark">
              <IonIcon size="large" slot="start" icon={cameraOutline} />
            </IonButton>
            <NotificationIcon />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent ref={contentRef} fullscreen>
        <>
          {(following.length < 1) ? <div className='no--post--message'>
            {/* <p>Welcome to <span className='novafriends'>NovaFriends</span> and <span>Congrats</span> on being invited!</p> */}
            <p><span className='follow' ><span>Follow</span></span> your friends to populate your Home Feed. 😁 </p>
          </div> : getPostInfoTile}
        </>
      </IonContent>
      {/* <IonModal isOpen={openModal} onWillDismiss={() => setopenModal(false)} enterAnimation={enterAnimation}>
        <IonContent className="page" fullscreen>
          <div className="page--container">
            <IonImg className="logo" src="assets/images/NovaFriendsWhite.svg" />
          </div>
        </IonContent>
      </IonModal> */}

    </IonPage>
  );
};

export default Home;

const NotificationIcon: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([])
  const history = useHistory()
  const user: User = useSelector(selectUser)
  const db = getFirestore()

  useEffect(() => {
    if (user.email) {
      const notifRef = query(collection(db, 'users/' + user.email + '/notifications'), where("seen", "==", false));
      onSnapshot(notifRef, (snapshot) => {
        const notifications: Notification[] = []
        snapshot.docs.map((doc) => {
          notifications.push(doc.data() as Notification)
        }
        )
        setNotifications(notifications)
        console.log(notifications)
      })
    }
  }, [user])

  return (
    <IonButton routerLink="/notifications" color="dark">
      <IonIcon className="notif--heart--icon" size="large" icon={heartOutline} />
      {notifications.length > 0 && <IonBadge className="notif--badge" color='danger' >{notifications.length}</IonBadge>}
    </IonButton>
  )
}

// blob to base64
function blobToBase64(blob: Blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}
const postLoaded = Date.now() < 1662889677810;
