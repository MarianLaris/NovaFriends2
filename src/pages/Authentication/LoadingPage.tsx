import { IonContent, IonPage } from '@ionic/react'
import React from 'react'
import { useHistory } from 'react-router'


const LoadingPage: React.FC = () => {
    
    return (
        <IonPage>
            <IonContent className="page" fullscreen>
                <div className="page--container">
                    <img className="logo" src="assets/images/Logo.svg" />
                </div>
            </IonContent>
        </IonPage>
    )
}


export default LoadingPage