import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, useIonActionSheet, useIonLoading, useIonAlert, IonRouterOutlet, IonRouterLink, createGesture, Gesture, IonImg } from '@ionic/react';
import { clipboardOutline, settingsOutline } from 'ionicons/icons';
import '../theme/Profile-UserProfile.css';
import { auth } from './firebase-config'
import { OTPCode, PostInfo, User } from '../Types/entitinities';
import { selectUser } from '../state/userState';
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useContext } from 'react';
import { selectFollowings } from '../state/followingsState';
import { selectFollowers } from '../state/followersSate';
import { collection, doc, getDoc, getFirestore, onSnapshot } from 'firebase/firestore';
import { setDoc } from 'firebase/firestore';
import { Clipboard } from "@capacitor/clipboard";
import { Share } from "@capacitor/share";
import { generateOTPCode } from './Authentication/generateCode';
import { useHistory } from 'react-router';
import nFormatter from '../components/NumberFormat';
import UIContext from "../Roots/TabsContext";
import { verified } from "../assets/assets"



const Profile: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const profilePic = auth.currentUser?.photoURL!
  const user: User = useSelector(selectUser)
  const dispatch = useDispatch()
  const followings: User[] = useSelector(selectFollowings)
  const followers: User[] = useSelector(selectFollowers)
  const [posts, setposts] = useState<PostInfo[]>([])
  const db = getFirestore();
  const [showSheet, dismissSheet] = useIonActionSheet()
  const [showAlert, dismissAlert] = useIonAlert()
  const [showLoading, dismissLoading] = useIonLoading()
  const history = useHistory()
  const { setShowTabs } = useContext(UIContext)
  const [gesture, setGesture] = useState<Gesture>()



  useEffect(() => {
    if (!user.email) {
      const userInfo: User = {
        email: auth.currentUser?.email || "",
        username: auth.currentUser?.displayName || "",
        photo: auth.currentUser?.photoURL || "",
        lastSeen: Date.now()
      }
      getPostInfos(userInfo)
    } else {
      getPostInfos(user)
    }

    const el = document.getElementById('profile-page');
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

  const getPostInfos = async (user: User) => {
    const postCollectionRef = collection(db, `users/${user.email}/posts`)
    onSnapshot(postCollectionRef, (data) => {
      setposts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id } as PostInfo)).sort((a, b) => b.createdAt - a.createdAt))
    })
  }

  async function invite() {
    // await showLoading({message:"Generating Code"})
    const code = await generateCode(user)
    // await dismissLoading()
    if (!code) {
      showAlert({ message: "Unable to get Code at this moment. Try again Later", buttons: [{ text: "OK", role: "cancel" }] });
      return;
    }

    showSheet({
      header: "Invite Code: " + code, buttons: [
        { icon: clipboardOutline, text: 'Copy', handler: () => copyCode(code) },
        // { icon: shareSocialOutline, text: 'Share', handler: () => shareCode(code) }
      ]
    })
  }

  async function copyCode(code: string) {
    await Clipboard.write({ string: code })
    showAlert({ message: "Code has been copied!", buttons: [{ text: "OK", role: "cancel" }] })
  }

  function shareCode(code: string) {
    Share.canShare().then(async res => {
      if (res.value) {
        showAlert({ message: "Feature is being worked on! 👷🏽 Just copy and text the code for now!", buttons: [{ text: "OK", role: "cancel" }] })
      } else {
        await Share.share({ dialogTitle: "Share Code", url: code })
      }
    }).finally(() => {
      dismissSheet()
    })
  }

  const followerLength = () => {
    if (followers.length === 1) {
      return `Follower`
    }
    else {
      return `Followers`
    }
  }

  const postLength = () => {
    if (posts.length === 1) {
      return `Post`
    }
    else {
      return `Posts`
    }
  }

  return (
    <IonPage id='profile-page' >

      {/* NavBar information. Need to add a settings IonButton. */}
      <IonHeader>
        <IonToolbar>
          <IonTitle className="profile--header--name">
            @{user.username}
            <span>{user.displayName}</span>
            {/* {user.username === "bengorski" ? <img className="profile--verified" height={20} width={20} src={verified} /> : '' } */}
          </IonTitle>

          <IonButtons className="home--btn--container" slot="primary">

            <IonButton routerLink="/Settings" color="dark">
              <IonIcon size="large" slot="end" icon={settingsOutline} />
            </IonButton>

          </IonButtons>
        </IonToolbar>
      </IonHeader>


      {/* Initiate the rest of the page content, excluding the bottom tabs. */}
      <IonContent fullscreen>


        <div className="profile--info">

          {/* Div for the main profile pic */}
          <div className="profile--pic--container">
            <IonImg className="profile--pic " src={user.photo} />
          </div>

          {/* Following */}

          <div className="following stats">
            <IonRouterLink routerLink="/followinglist">
              <h2 className="stats--info">{nFormatter(followings?.length || 0, 1)}</h2>
              <h3 className="stats--desc">following</h3>
            </IonRouterLink>
          </div>


          {/* Followers */}

          <div className="followers stats">
            <IonRouterLink className='router' routerLink="/followerslist">
              <h2 className="stats--info">{nFormatter(followers?.length || 0, 1)}</h2>
              <h3 className="stats--desc">{followerLength()}</h3>
            </IonRouterLink>
          </div>


          {/* Stories */}
          <div className="stories stats">
            <h2 className="stats--info">{nFormatter(posts.length || 0, 1)}</h2>
            <h3 className="stats--desc">{postLength()}</h3>
          </div>

          {/* Button which is either: Edit Profile, Follow, Unfollow */}
          <div className="button-container">
            <IonButton onClick={invite} className="profile--button you">invite!</IonButton>
          </div>

          {/* Bio information */}
          <div className="bio">
            <p className="bio--text">
              {user.bio} </p>
          </div>

        </div>


        {/* Div to house the posts on your profile page. Will need to adjust later. */}
        <div className="profile--tile--images">

          {
            posts.map((post, index) => (
              <div key={index} onClick={() => { history.push('/post', { post }) }} className="profile--image--container">
                {post.image && <img className="actual--image" src={post.image} alt="" />}
                {post.video && <video className="actual--image" src={post.video} />}
              </div>
            ))
          }

        </div>


      </IonContent>
    </IonPage>
  );
};

export default Profile;

async function generateCode(user: User): Promise<null | string> {

  const code = generateOTPCode()
  const db = getFirestore()
  if (!code) {
    return null
  }
  const docRef = doc(db, `invites`, code)
  const codeData: OTPCode = {
    id: code,
    user: user,
    timestamp: Date.now(),
    invites: []
  }
  return getDoc(docRef).then(async (doc) => {
    if (doc.data()) {
      return generateCode(user);
    }
    else {
      return await setDoc(docRef, codeData).then(() => {
        return code
      }).catch((err) => {
        console.log(err)
        return null
      })
    }
  }).catch((err) => {
    console.log(err)
    return null
  })
}