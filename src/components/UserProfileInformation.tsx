import { IonButton, IonImg } from '@ionic/react';
import '../theme/Profile-UserProfile.css';



// // Props:

// username
// display_name
// profile_pic
// bio
// posts 
// followers
// following

export default function RenderUser(props: any) {
  return (
    <>

      <div className="profile--info">

        <div className="profile--pic--container">
          <IonImg className="profile--pic" src={props.profile_pic} alt="" />
        </div>

        <div className="following stats">
          <h2 className="stats--info">{props.following}</h2>
          <h3 className="stats--desc">following</h3>
        </div>

        <div className="followers stats">
          <h2 className="stats--info">{props.followers}</h2>
          <h3 className="stats--desc">followers</h3>
        </div>

        <div className="stories stats">
          <h2 className="stats--info">{props.posts}</h2>
          <h3 className="stats--desc">posts</h3>
        </div>

        <div className="username">
          <h1>{props.username}</h1>
        </div>

        <div className="button-container">
          <IonButton className="profile--button" fill="clear">follow</IonButton>
        </div>

        <div className="bio">
          <p className="bio--text">
            {props.bio} </p>
        </div>

      </div>


      <div className="profile--tile--images">
        <div className="image--one profile--image">
          <IonImg src="assets/images/headshot.jpeg" alt="" />
        </div>
        <div className="image--two profile--image">
          <IonImg src="assets/images/headshot.jpeg" alt="" />
        </div>
        <div className="profile--image">
          <IonImg src="assets/images/headshot.jpeg" alt="" />
        </div>
        <div className="profile--image">
          <IonImg src="assets/images/headshot.jpeg" alt="" />
        </div>
      </div>

    </>
  )
};