import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonSearchbar, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import { chevronBackOutline } from 'ionicons/icons';
import '../theme/Users.css';
import React, { useState } from 'react';
import { UserCard } from './UsersList';
import { User } from '../Types/entitinities';
import { useSelector } from 'react-redux';
import { selectFollowers } from '../state/followersSate';
import { useHistory } from 'react-router';
import { collection, getDocs, getFirestore } from 'firebase/firestore';



const Followers: React.FC = () => {

  const history = useHistory()
  const router = useIonRouter()
  const [searchText, setSearchText] = useState('');
  const followers: User[] = useSelector(selectFollowers)
  const [followersList, setFollowersList] = useState<User[]>([])
  const [BfollowersList, setBFollowersList] = useState<User[]>([])
  const db = getFirestore()



  useIonViewWillEnter(() => {
    const state = history.location.state as { user: User }
    if (state?.user) {
      getFollowers(state.user)
    } else {

      setFollowersList(followers)
      setBFollowersList(followers)
    }
  })

  function getFollowers(user: User) {

    setFollowersList([])
    setBFollowersList([])
    const followersRef = collection(db, 'users/' + user.email + '/followers');
    getDocs(followersRef).then((snapshot) => {
      const followers: User[] = []
      snapshot.docs.map((doc) => {
        followers.push(doc.data() as User)
      })

      setFollowersList(followers)
      setBFollowersList(followers)
    }
    )
  }

  function SearchText(text: string) {
    if (!text) {
      setFollowersList(BfollowersList)
      return;
    }
    const searchList = BfollowersList.filter((user) => {
      return user.username.toLowerCase().includes(text.toLowerCase())
    })
    setFollowersList(searchList)
  }


  return (
    <IonPage>

      {/* NavBar information. Need to add a settings IonButton. */}
      <IonHeader className="users--header">
        <IonToolbar>
          <IonTitle className="users--header--name">Followers
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


        {/* USER STYLING CONTAINER */}
        {
          followersList.map((user, index) => {
            return (
              <UserCard app_user={user} key={index} />
            )
          })
        }
      </IonContent>
    </IonPage>
  );
};

export default Followers;