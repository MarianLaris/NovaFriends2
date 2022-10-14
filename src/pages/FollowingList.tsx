import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonSearchbar, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import { chevronBackOutline } from 'ionicons/icons';
import '../theme/Users.css';
import React, { useState } from 'react';
import { User } from '../Types/entitinities';
import { useSelector } from 'react-redux';
import { UserCard } from './UsersList';
import { selectFollowings } from '../state/followingsState';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { useHistory } from 'react-router';



const Following: React.FC = () => {

  const router = useIonRouter()
  const [searchText, setSearchText] = useState('');
  const followings: User[] = useSelector(selectFollowings)
  const [followingList, setfollowingList] = useState<User[]>([])
  const [BfollowingList, setBfollowingList] = useState<User[]>([])
  const db = getFirestore()
  const history = useHistory()



  useIonViewWillEnter(() => {
    const state = history.location.state as { user: User }
    if (state?.user) {
      getfollowing(state.user)
    } else {
      setfollowingList(followings)
      setBfollowingList(followings)
    }
  })

  function getfollowing(user: User) {

    setfollowingList([])
    setBfollowingList([])
    const followingRef = collection(db, 'users/' + user.email + '/following');
    getDocs(followingRef).then((snapshot) => {
      const following: User[] = []
      snapshot.docs.map((doc) => {
        following.push(doc.data() as User)
      })
      setfollowingList(following)
      setBfollowingList(following)
    }
    )
  }

  function SearchText(text: string) {
    if (!text) {
      setfollowingList(BfollowingList)
      return;
    }
    const searchList = BfollowingList.filter((user) => {
      return user.username.toLowerCase().includes(text.toLowerCase())
    })
    setfollowingList(searchList)
  }


  return (
    <IonPage>

      {/* NavBar information. Need to add a settings IonButton. */}
      <IonHeader className="users--header">
        <IonToolbar>
          <IonTitle className="users--header--name">Following
          </IonTitle>
          <IonButtons className="users--btn--container" slot="secondary">
            <IonButton onClick={() => router.goBack()} routerDirection="back" color="dark">
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
          followingList.map((user, index) => {
            return (
              <UserCard app_user={user} key={index} />
            )
          })
        }
      </IonContent>
    </IonPage>
  );
};

export default Following;