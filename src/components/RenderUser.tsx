import { IonButton, IonImg, IonNote, useIonAlert, useIonToast } from '@ionic/react';
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { selectBlockedBy } from '../state/blockedByState';
import { selectBlockedUsers, updateBlockedUsersInfo } from '../state/blockedUsers';
import { updateFollowersInfo } from '../state/followersSate';
import { selectFollowings, updateFollowingInfo } from '../state/followingsState';
import { selectUser } from '../state/userState';
import '../theme/Profile-UserProfile.css';
import { Notification, PostInfo, User } from '../Types/entitinities';
import { sendNotification } from './Notifications/notificationConfig';
import nFormatter from './NumberFormat';
import { Virtuoso } from 'react-virtuoso';



export default function RenderUser(props: { user: User }) {
  const { user } = props;
  const history = useHistory()
  const [following, setFollowing] = useState<User[]>([])
  const followings: User[] = useSelector(selectFollowings)
  const [followers, setFollowers] = useState<User[]>([])
  const [posts, setPosts] = useState<PostInfo[]>([])
  const [updatedUser, setupdaedUser] = useState<User>(user)
  const blockedBy: User[] = useSelector(selectBlockedBy)
  const blocked: User[] = useSelector(selectBlockedUsers)

  const db = getFirestore()
  const followingCollectionRef = collection(db, `users/${user.email}/following`)
  const followersCollectionRef = collection(db, `users/${user.email}/followers`)
  const postCollectionRef = collection(db, `users/${user.email}/posts`)



  useEffect(() => {
    getDocs(followingCollectionRef).then((data) => {
      const following = data.docs.map((doc) => ({ ...doc.data() } as User))
      setFollowing(following)
    })

    getDocs(followersCollectionRef).then((data) => {
      const followers = data.docs.map((doc) => ({ ...doc.data() } as User))
      setFollowers(followers)
    })

    getDocs(postCollectionRef).then((data) => {
      const posts = data.docs.map((doc) => ({ ...doc.data() } as PostInfo))
      setPosts(posts.sort((a, b) => b.createdAt - a.createdAt))
    })

    getDoc(doc(db, 'users', user.email)).then((data) => {
      const updatedUser = data.data() as User
      setupdaedUser(updatedUser)
    })

  }, [user])

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
    <>
      <div className="profile--info">
        <div className="profile--pic--container">
          <IonImg className="profile--pic" src={updatedUser.photo} alt="" />
        </div>

        <div className="following stats" onClick={() => { history.push("/followinglist", { user: user }) }}>
          <h2 className="stats--info">{nFormatter(following.length || 0, 1)}</h2>
          <h3 className="stats--desc">following</h3>
        </div>

        <div className="followers stats" onClick={() => { history.push("/followerslist", { user: user }) }}>
          <h2 className="stats--info">{nFormatter(followers.length || 0, 1)}</h2>
          <h3 className="stats--desc">{followerLength()}</h3>
        </div>


        <div className="stories stats" >
          <h2 className="stats--info">{nFormatter(posts.length || 0, 1)}</h2>
          <h3 className="stats--desc">{postLength()}</h3>
        </div>

        <div className="button-container">
          <FollowButton appUser={user}></FollowButton>
        </div>

        <div className="bio">
          <p className="bio--text">
            {updatedUser.bio}
          </p>
        </div>
      </div>

      {
        blockedBy.find(u => u.email == user.email) ? <div style={{ padding: '20px', textAlign: "center" }}><IonNote>This user has blocked you.</IonNote></div> :
          blocked.find(u => u.email == user.email) ? <div style={{ padding: '20px', textAlign: "center" }}><IonNote>You have blocked this user.</IonNote></div> :
            <div className="profile--tile--images">
              {posts.map((post, index) => {
                return (
                  <div onClick={() => { history.push('/post', { post }) }} className="profile--image--container">
                    {post.image && <img className="actual--image" src={post.image} alt="" />}
                    {post.video && <video className="actual--image" src={post.video} />}
                  </div>)
              })
              }

            </div>
      }
    </>
  )
};





const FollowButton: React.FC<{ appUser: User }> = ({ appUser }) => {
  const user: User = useSelector(selectUser)
  const dispatch = useDispatch()
  const db = getFirestore()
  const [showToast, dissmissToast] = useIonToast()
  const blockedUsers: User[] = useSelector(selectBlockedUsers)
  const isBlocked = !!blockedUsers.find((u => u.email == appUser.email))
  const [showAlert, dismissAlert] = useIonAlert()


  // Constants
  const followings: User[] = useSelector(selectFollowings)
  const [followloading, setFollowLoading] = useState(false)
  const [isFollowingUser, setIsFollowingUser] = useState(false)

  useEffect(() => {
    setIsFollowingUser(appUser ? followings.filter(following => following.email === appUser!.email).length > 0 : false);
  }, [followings])

  async function unBlockUser() {
    const blockedRef = doc(db, `users/${user.email}/blocked`, appUser.email);
    const BlockedCollectionRef = collection(db, `users/${user.email}/blocked`)
    const BlockedByRef = doc(db, `users/${appUser.email}/blocked-by`, user.email)
    const univBlockedByRef = doc(db, `blocked/${appUser.email}/blocked-by`, user.email)

    await deleteDoc(blockedRef)
    await deleteDoc(BlockedByRef)
    await deleteDoc(univBlockedByRef)


    await getDocs(BlockedCollectionRef).then((data) => {
      const blocked = data.docs.map((doc) => ({ ...doc.data() } as User))
      dispatch(updateBlockedUsersInfo(blocked))
    })

    // showToast({ message: "User unblocked", duration: 2000 });
    showToast(`unblocked @${appUser?.username}`, 2000)
  }
  async function unfollowUser() {
    setFollowLoading(true)
    if (user.email) {
      setFollowLoading(true)
      try {
        if (appUser) {
          await deleteDoc(doc(db, `users/${appUser?.email}/followers/${user.email}`))
          await deleteDoc(doc(db, `users/${user.email}/following/${appUser?.email}`))
          await deleteDoc(doc(db, `users/${appUser?.email}/notifications/${user.email + "following"}`))
          getDocs(collection(db, `users/${user.email}/following`)).then((data) => {
            dispatch(updateFollowingInfo(data.docs.map((doc) => ({ ...doc.data() } as User))));
          })
          getDocs(collection(db, `users/${user.email}/followers`)).then((data) => {
            dispatch(updateFollowersInfo(data.docs.map((doc) => ({ ...doc.data() } as User))));
          })
        }
        showToast(`successfully unfollowed @${appUser!.username}`, 2000)

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
        showToast(`successfully followed @${appUser!.username}`, 2000)

      } catch (err: any) {
        showToast({ message: err.message, duration: 2000 });

      }
      setFollowLoading(false)
    }
  }

  return (
    <>
      {
        isBlocked ?
          <>
            <IonButton disabled={followloading}
              onClick={() => { showAlert('Unblock this user?', [{ text: 'Cancel', role: 'Cancel' }, { text: 'Unblock', handler: unBlockUser }]); }}
              mode="ios"
              className="profile--button blocked"
              fill="clear"
            >Blocked</IonButton>
          </> :
          <>
            {isFollowingUser ? <IonButton disabled={followloading}
              onClick={() => { unfollowUser() }}
              mode="ios"
              className="profile--button following"
              fill="clear"
            >Following</IonButton> :
              <IonButton
                disabled={followloading}
                onClick={followUser}
                fill="clear"
                className="profile--button"
              >Follow</IonButton>}
          </>
      }</>
  )
}