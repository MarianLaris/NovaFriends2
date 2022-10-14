import React, { useContext, useEffect, useState } from 'react'
import { Redirect, Route, useHistory } from 'react-router-dom';
import {
  setupIonicReact,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonRouterOutlet,
} from '@ionic/react';
import { homeOutline, globeOutline, personOutline } from 'ionicons/icons';
import UIContext from "./TabsContext";

import Home from '../pages/Home';
import Discover from '../pages/Discover';
import Profile from '../pages/Profile';
import Likes from '../pages/Likes';
import LikesPostLarge from '../pages/LikesPostLarge';
import Post from '../components/PostLarge';
import Users from '../pages/UsersList';
import UserProfile from '../pages/UserProfile';
import Notifications from '../pages/Notifications';
import PostImage from '../pages/PostImage';
import Settings from '../pages/Settings/Settings';
import CreatePost from '../pages/NewPost'
import { auth } from '../pages/firebase-config';
import ConfirmEmail from '../pages/Authentication/ConfirmEmail';
import Followers from '../pages/FollowersList';
import Following from '../pages/FollowingList';

import '../theme/HomeRoot.css';
import { updateModalState } from '../state/loadingModalState';
import { useDispatch } from 'react-redux';

setupIonicReact();

// TabRoot
const HomeRoot: React.FC = () => {
  const [isVerified, setIsVerified] = useState(true);
  const { showTabs } = useContext(UIContext);
  const history = useHistory()
  const dispatch = useDispatch()

  let tabBarStyle = showTabs ? undefined : { display: "none" };
  let tabBarClass = 'animate__animated animate__slideInUp homeroot'


  let itv: any = null;
  useEffect(() => {
    if (!auth.currentUser?.emailVerified) {
      setIsVerified(false);
      itv = setInterval(async () => {
        await auth.currentUser?.reload();
        if (auth.currentUser?.emailVerified) {
          clearInterval(itv);
          dispatch(updateModalState({ isOpen: true }))
          setIsVerified(true);
          history.push('/home')
        }
      }, 1500);
    }
  }, [auth.currentUser?.emailVerified]);

  useEffect(() => {
    return () => {
      if (itv) {
        clearInterval(itv);
      }
    };
  }, []);


  const getRoutes = () => {
    return (
      <IonTabs>

        <IonRouterOutlet>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
          <Route exact path="/login">
            <Redirect to="/home" />
          </Route>
          <Route exact path="/register">
            <Redirect to="/home" />
          </Route>
          <Route exact path="/forgotpasswordpage">
            <Redirect to="/home" />
          </Route>
          <Route exact path="/firstpage">
            <Redirect to="/home" />
          </Route>
          <Route exact path="/home">
            <Home />
          </Route>

          <Route exact path="/discover">
            <Discover />
          </Route>

          <Route exact path="/profile">
            <Profile />
          </Route>

          <Route exact path="/notifications">
            <Notifications />
          </Route>

          <Route exact path="/postimage">
            <PostImage />
          </Route>

          <Route exact path="/likes">
            <Likes />
          </Route>

          <Route exact path="/likespostlarge">
            <LikesPostLarge />
          </Route>

          <Route exact path="/post">
            <Post />
          </Route>

          <Route exact path="/users">
            <Users />
          </Route>

          <Route exact path="/userprofile">
            <UserProfile />
          </Route>

          <Route exact path="/settings">
            <Settings />
          </Route>

          <Route exact path="/createpost">
            <CreatePost />
          </Route>

          <Route exact path="/followinglist">
            <Following />
          </Route>

          <Route exact path="/followerslist">
            <Followers />
          </Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom" style={tabBarStyle} className={tabBarClass}>

          <IonTabButton tab="home" href="/home">
            <IonIcon icon={homeOutline} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>

          <IonTabButton tab="discover" href="/discover">
            <IonIcon icon={globeOutline} />
            <IonLabel>Discover</IonLabel>
          </IonTabButton>


          <IonTabButton tab="profile" href="/profile">
            <IonIcon icon={personOutline} />
            <IonLabel>Profile</IonLabel>
          </IonTabButton>


        </IonTabBar>

      </IonTabs>)

  }

  const suggestVerification = () => (
    <IonRouterOutlet>
      <Route exact path="/">
        <Redirect to="/confirmemail" />
      </Route>
      <Route exact path="/register">
        <Redirect to="/confirmemail" />
      </Route>
      <Route exact path="/confirmemail">
        <ConfirmEmail />
      </Route>
    </IonRouterOutlet>
  );

  return isVerified ? getRoutes() : suggestVerification();
};

export default HomeRoot;
