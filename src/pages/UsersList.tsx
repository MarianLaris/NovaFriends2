import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonSearchbar, useIonRouter, useIonToast, useIonAlert, IonImg } from '@ionic/react';
import { chevronBackOutline } from 'ionicons/icons';
import '../theme/Users.css';
import React, { useEffect, useState } from 'react';
import { User } from '../Types/entitinities';
import { getDocs, getFirestore, collection, deleteDoc, doc } from 'firebase/firestore';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { selectUser } from '../state/userState';
import { UniversalFollowButton } from './Notifications';
import { selectBlockedUsers, updateBlockedUsersInfo } from '../state/blockedUsers';
import { verified } from "../assets/assets"





const Users: React.FC = () => {

  const [searchText, setSearchText] = useState('');
  const [users, setusers] = useState<User[]>([]);
  const [Busers, setBusers] = useState<User[]>([]);
  const db = getFirestore()




  useEffect(() => {
    getAllUsers()
  }, [])

  function getAllUsers() {
    getDocs(collection(db, "users")).then((res) => {
      setusers(res.docs.map((doc) => doc.data() as User).sort((a, b) => a.lastSeen - b.lastSeen))
      setBusers(res.docs.map((doc) => doc.data() as User).sort((a, b) => a.lastSeen - b.lastSeen))
    })
  }

  function SearchText(text: string) {
    if (!text) {
      setusers(Busers)
      return;
    }
    const searchList = Busers.filter((user) => {
      return user.username.toLowerCase().includes(text.toLowerCase())
    })
    setusers(searchList)
  }


  return (
    <IonPage>

      {/* NavBar information. Need to add a settings IonButton. */}
      <IonHeader className="users--header">
        <IonToolbar>
          <IonTitle className="users--header--name">Users
          </IonTitle>
          <IonButtons className="users--btn--container" slot="secondary">
            <IonButton routerLink="/discover" routerDirection="back" color="dark">
              <IonIcon size="large" slot="start" icon={chevronBackOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>


      {/* Initiate the rest of the page content, excluding the bottom tabs. */}
      <IonContent fullscreen>


        {/* SEARCHBAR */}
        <IonSearchbar className="searchbar--users" onIonChange={e => SearchText(e.detail.value!)} showCancelButton="never"></IonSearchbar>
        {
          users.map((user, key) => {
            return (
              <UserCard key={key} app_user={user} />
            )
          })
        }

      </IonContent>
    </IonPage>
  );
};


export default Users;


export const UserCard: React.FC<{ app_user: User }> = ({ app_user }) => {

  const user: User = useSelector(selectUser)
  const db = getFirestore()
  const blockedUsers: User[] = useSelector(selectBlockedUsers)
  const isBlocked = !!blockedUsers.find((usr) => usr.email == app_user.email)
  const dispatch = useDispatch();
  const [showToast] = useIonToast()
  const [showAlert, dismissAlert] = useIonAlert()
  const [verifiedUser, setVerifiedUser] = useState("./Verified.svg")
  const [verifiedMember, setVerifiedMember] = useState(['bengorski', 'cam']);


  // Constants
  const history = useHistory();
  const router = useIonRouter()

  async function unBlockUser() {
    const blockedRef = doc(db, `users/${user.email}/blocked`, app_user.email);
    const BlockedCollectionRef = collection(db, `users/${user.email}/blocked`)
    const BlockedByRef = doc(db, `users/${app_user.email}/blocked-by`, user.email)
    const univBlockedByRef = doc(db, `blocked/${app_user.email}/blocked-by`, user.email)

    await deleteDoc(blockedRef)
    await deleteDoc(BlockedByRef)
    await deleteDoc(univBlockedByRef)


    await getDocs(BlockedCollectionRef).then((data) => {
      const blocked = data.docs.map((doc) => ({ ...doc.data() } as User))
      dispatch(updateBlockedUsersInfo(blocked))
    })

    // showToast({ message: "User unblocked", duration: 2000 });
    showToast(`unblocked @${app_user?.username}`, 2000)
  }

  async function confirmBlock() {
    await showAlert({ message: 'Are you sure you want to unblock ' + app_user.username, header: "Unblock", buttons: [{ text: "Unblock", handler: unBlockUser }, { text: "Cancel", role: 'cancel' }] })
  }

  return (

    <div className="users--container">
      {/* USER STYLING CONTAINER */}
      <div className='userpic--username--container'>
        <IonImg className="pic--users" src={app_user.photo} />
        <div className="users--name--container">
          <div className='users--name--verified'>
            <IonButton onClick={() => { history.push(user.email !== app_user.email ? "/UserProfile" : "/profile", { user: app_user }) }} fill="clear" className="users--button likes">
              <span className="username--span">@{app_user.username || app_user.email.split("@")[0]}</span>
            </IonButton>
            {verifiedMember.includes(`${app_user.username}`) ? <img height={15} width={15} className="profile--verified" src={verified} /> : ''}

          </div>
          <p>{app_user.displayName}</p>
        </div>
      </div>
      <div className='btn--container'>
        {
          isBlocked ? <IonButton className={"button--notif--follow blocked"} fill='clear' onClick={confirmBlock}>Blocked</IonButton> :
            <UniversalFollowButton className={"button--notif--follow"} appUser={app_user} />
        }
      </div>
    </div>
  )
}