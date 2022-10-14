import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, createGesture, Gesture } from '@ionic/react';
import '../theme/Home-Discover.css';
import React from 'react';
import { useState, useEffect } from 'react';

import { auth } from './firebase-config'
import { collection, doc, getDocs, getFirestore, orderBy, query, where } from 'firebase/firestore'
import RenderDiscoverPagePosts from '../components/PostSmallDiscover'
import nFormatter from '../components/NumberFormat';
import { User } from '../Types/entitinities';
import { onSnapshot } from 'firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { selectFollowers, updateFollowersInfo } from '../state/followersSate';
import { selectFollowings, updateFollowingInfo } from '../state/followingsState';
import { selectUser, update_user } from '../state/userState';
import { PostInfo } from '../Types/entitinities';
import { Device } from "@capacitor/device"
import { selectBlockedBy } from '../state/blockedByState';
import { selectBlockedUsers } from '../state/blockedUsers';
import { Virtuoso } from 'react-virtuoso';
import { updateModalState } from '../state/loadingModalState';


const Discover: React.FC = () => {

  const [posts, setPostInfos] = useState<PostInfo[]>([])
  const [users, setUsers] = useState<User[]>([])
  const history = useHistory()
  const dispatch = useDispatch()
  const user: User = useSelector(selectUser);
  const db = getFirestore();
  const blockedBy: User[] = useSelector(selectBlockedBy)
  const blocked: User[] = useSelector(selectBlockedUsers)
  const rejectedEmails: string[] = [...blockedBy.map(f => f.email), ...blocked.map(f => f.email)]
  const postCollectionRef = collection(db, 'posts')
  const userssCollectionRef = collection(db, 'users')
  const followers: User[] = useSelector(selectFollowers)
  const followings: User[] = useSelector(selectFollowings)
  const [isAndroid, setisAndroid] = useState(false)
  const [hidden, sethidden] = useState(true)
  const [gesture, setGesture] = useState<Gesture>()




  useEffect(() => {
    const el = document.getElementById('discover-page');
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
    const userInfo: User = {
      email: auth.currentUser?.email || "",
      username: auth.currentUser?.displayName || "",
      photo: auth.currentUser?.photoURL || "",
      lastSeen: Date.now()
    }
    if (followers.length < 0 || followings.length < 0) {
      const followingCollectionRef = collection(db, `users/${userInfo.email}/following`)
      const followersCollectionRef = collection(db, `users/${userInfo.email}/followers`)

      getDocs(followingCollectionRef).then((data) => {
        const following = data.docs.map((doc) => ({ ...doc.data() } as User))
        dispatch(updateFollowingInfo(following))

      })

      getDocs(followersCollectionRef).then((data) => {
        const followers = data.docs.map((doc) => ({ ...doc.data() } as User))
        dispatch(updateFollowersInfo(followers))


      })
    }

  }, [])


  useEffect(() => {
    // if (rejectedEmails.length > 0) {
    getPosts()
    // }
  }, [])

  useEffect(() => {
    getUsers()
    if (!user.email) {
      updateUser()
    }
  }, [])



  function updateUser() {
    const userRef = doc(db, `users`, auth.currentUser!.email || "")
    onSnapshot(userRef, (data) => {
      const userInfo: User = {
        ...data.data(),
      } as User
      dispatch(update_user(userInfo))
      // getUserData(userInfo)
    })
  }


  useEffect(() => {
    Device.getInfo().then(info => {

      setisAndroid(info.platform === "android" || info.operatingSystem === "android")
    })

  }, [])


  const getPosts = async () => {
    try {
      onSnapshot(query(postCollectionRef, orderBy("createdAt", "desc")), (data) => {
        setPostInfos(data.docs.map((doc) => ({ ...doc.data(), id: doc.id } as PostInfo)).filter(post => !rejectedEmails.find(em => post.user?.email == em)))
        setTimeout(() => {
          dispatch(updateModalState({ isOpen: false }))
        }, 1000);
      })
    } catch (err) {
      console.log(err)
    }
  }

  const getPostTile = posts.map((item) => {
    return (
      <RenderDiscoverPagePosts
        key={item.id}
        post={item}
      />
    );
  })

  function getUsers() {
    onSnapshot(userssCollectionRef, (data) => {
      setUsers(data.docs.map((doc) => ({ ...doc.data() } as User)))
    })
  }

  return (
    <IonPage id='discover-page'>
      {/* NavBar Section */}
      <IonHeader >
        <IonToolbar>
          <IonTitle className="home--header--name">Discover</IonTitle>
          {isAndroid && <IonButton style={{ marginRight: "10px" }} slot="end" className="discover--button users" routerLink="/users" color="clear">
            {`${nFormatter(users.length, 1)} Users`}
          </IonButton>}
        </IonToolbar>
      </IonHeader>

      {/* Initiate the rest of the page content, excluding the bottom tabs. */}
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <div className="title--load--container">
              <IonTitle className="title--load">Discover</IonTitle>
              <IonButton className="discover--button users" routerLink="/users" color="clear">
                {`${nFormatter(users.length, 1)} Users`}
              </IonButton>
            </div>
          </IonToolbar>
        </IonHeader>
        {getPostTile}
      </IonContent>
    </IonPage>
  );
};

export default Discover;