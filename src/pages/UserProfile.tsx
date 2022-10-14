
import { IonContent, IonHeader, IonPage, IonToolbar, IonButtons, IonButton, IonIcon, useIonRouter, useIonViewWillEnter, useIonToast, IonItem, IonLabel, IonPopover, useIonActionSheet, IonProgressBar, useIonAlert } from '@ionic/react';
import { banOutline, chevronBackOutline, ellipsisVertical, personOutline } from 'ionicons/icons';
import '../theme/Profile-UserProfile.css';
import RenderUser from '../components/RenderUser'
import { useState, useRef } from 'react';
import { collection, doc, getDoc, getDocs, getFirestore, setDoc } from 'firebase/firestore'
import { User } from '../Types/entitinities';
import { useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../state/userState';
import { updateBlockedUsersInfo } from '../state/blockedUsers';
import { verified } from "../assets/assets"




const UserProfile: React.FC = () => {

  const db = getFirestore()
  const popover = useRef<HTMLIonPopoverElement>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const user: User = useSelector(selectUser)
  const [showToast, dissmissToast] = useIonToast()
  const [showSheet, dismissSheet] = useIonActionSheet()
  const [showAlert, dismissAlert] = useIonAlert()
  const router = useIonRouter()
  const [loading, setloading] = useState(false)
  const dispatch = useDispatch()
  const [verifiedMember, setVerifiedMember] = useState(['bengorski', 'cam']);


  // Extract values from Firebase
  const [thisUser, setthisUser] = useState<User>()
  const history = useHistory()



  useIonViewWillEnter(() => {
    const state = history.location.state as { user: User }
    if (state && state.user) {
      setthisUser(state.user)
      updateUserInfo(state.user)
    }
  })

  async function updateUserInfo(u: User) {
    const userRef = doc(db, "users", u.email)
    try {
      const usr = await getDoc(userRef)
      setthisUser(usr.data() as User)
    } catch (err) {
      console.log(err)
    }
  }

  const openPopover = (e: any) => {
    popover.current!.event = e;
    setPopoverOpen(true);
  };

  async function blockUser() {

    if (!thisUser?.email || !user.email) {
      return;
    }

    // setloading(true)
    try {
      const blockedUserRef = doc(db, `users/${user?.email}/blocked`, thisUser!.email);
      const blockedByUserRef = doc(db, `users/${thisUser?.email}/blocked-by`, user!.email);
      const blockRef = doc(db, `blocked`, thisUser.email);
      const blockedRef = doc(db, `blocked/${thisUser!.email}/blocked-by`, user.email);



      await setDoc(blockedUserRef, thisUser);
      await setDoc(blockedRef, thisUser);
      await setDoc(blockRef, thisUser);
      await setDoc(blockedByUserRef, user);
      await getDocs(collection(db, `users/${user?.email}/blocked`)).then((data) => {
        const blocked = data.docs.map((doc) => ({ ...doc.data() } as User))
        dispatch(updateBlockedUsersInfo(blocked))
        console.log(blocked)
      })


    } catch (err: any) {
      showAlert({ message: err.message, header: 'Blocking Error' })
    }
    // setloading(false)
    showToast(`blocked @${thisUser?.username}`, 2000)
  }

  async function reportUser() {
    setPopoverOpen(false)
    await showSheet({
      header: 'Report User',
      buttons: [
        { text: 'Inappropriate  Content', handler: () => { uploadReportStatus('Inappropriate  Content') } },
        { text: 'Inappropriate  Behavior', handler: () => { uploadReportStatus('Inappropriate Behavior') } },
        { text: 'Other', handler: () => { uploadReportStatus('Other') } },
      ]
    })

  }

  async function uploadReportStatus(value: string) {
    const report = {
      id: user.email + thisUser?.email,
      reporter: user,
      reported: thisUser,
      type: value,
      timestamp: Date.now(),
    }

    showToast(`@${thisUser?.username} has been reported`, 2000)
    const reportRef = doc(db, `reports/${report.id}`)
    await setDoc(reportRef, report)
  }

  const getUserTile = (thisUser ? [thisUser] : []).map((item: any) => {
    return (
      <RenderUser
        key={item.id}
        user={item}

      />
    )
  })

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar>
          <div className='user--profile--header--container'>
            {verifiedMember.includes(`${thisUser?.username}`) ? <img height={20} width={20} className="profile--verified" src={verified} /> : ''}
            <h1 className="user--profile--header--name">@{thisUser?.username}<span>{thisUser?.displayName}</span></h1>{ }
          </div>
          <IonButtons className="home--btn--container" slot="secondary">
            <IonButton onClick={() => router.goBack()} routerDirection="back" color="dark">
              <IonIcon size="large" slot="start" className='user--profile--back--button' icon={chevronBackOutline} />
            </IonButton>
          </IonButtons>


          <IonButton onClick={openPopover} className='user--profile--report--button' slot='end' fill='clear'>
            <IonIcon icon={ellipsisVertical}></IonIcon>
          </IonButton>
          <IonPopover ref={popover} isOpen={popoverOpen} onDidDismiss={() => setPopoverOpen(false)}>
            <IonContent class="ion-padding">
              <IonItem onClick={() => {
                setPopoverOpen(false);
                showAlert('Are you sure you want to block this user?', [{ text: 'Cancel', role: 'cancel' }, { text: 'Block', handler: blockUser }])
              }} lines='none' button>
                <IonIcon size='small' icon={personOutline} slot='start'></IonIcon>
                <IonLabel >Block User</IonLabel>
              </IonItem>
              <IonItem onClick={() => { setPopoverOpen(false); reportUser() }} lines='none' button>
                <IonIcon color='danger' size='small' icon={banOutline} slot='start'></IonIcon>
                <IonLabel color='danger'>Report User</IonLabel>
              </IonItem>
            </IonContent>
          </IonPopover>

        </IonToolbar>
        {
          loading && <IonProgressBar type='indeterminate' />
        }
      </IonHeader>
      <IonContent fullscreen>

        {user && getUserTile}
      </IonContent>
    </IonPage>
  );
};

export default UserProfile;