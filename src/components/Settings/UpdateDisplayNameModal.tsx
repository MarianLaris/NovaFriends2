import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonModal, IonNote, IonProgressBar, IonTitle, IonToolbar } from '@ionic/react'
import { User } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useRef, useState } from 'react'
import { useSelector } from 'react-redux';

import { selectUser } from '../../state/userState';

const UpdateDisplayNameModal:React.FC <{isOpen:boolean, onDidDismiss:(()=>void)}>= ({isOpen, onDidDismiss}) => {

    const user:User = useSelector(selectUser)
    const [displayName, setDisplayName] = useState(user.displayName||'')
    const [loading, setloading] = useState(false)
    const [error, seterror] = useState('')
    const modal = useRef<HTMLIonModalElement>(null);
    const db = getFirestore()

    async function updateDisplayName(){
        
        if(!displayName){
            seterror('Display name is required')
            return
        }

        const userRef = doc(db, 'users/' + user.email);
        const usr: User = { ...user, displayName };
        setloading(true)
        seterror('')
    
        try {
         
          await setDoc(userRef, usr);
          onDidDismiss()
          modal.current?.dismiss()
          
        } catch (err) {
          console.log(err)
        }
        setloading(false)
        seterror('')

      }

      
  return (
    <IonModal isOpen={isOpen} onDidDismiss={()=>onDidDismiss()} ref={modal} trigger="open-username-modal" initialBreakpoint={0.25} breakpoints={[0, 0.25, 0.5, 0.75]}>
          <IonHeader>
          <IonToolbar color='none'>
            
           <IonTitle> Change Display Name</IonTitle>
          {user.displayName!=displayName&&  <IonButtons onClick={updateDisplayName} slot='end'>
                <IonButton color='tertiary'>Save</IonButton>
            </IonButtons>}
            </IonToolbar>
           {loading&& <IonProgressBar color='tertiary' type='indeterminate'></IonProgressBar>}
          </IonHeader>
          <IonContent className="ion-padding">
           <IonItem onClick={()=>modal.current?.setCurrentBreakpoint(0.75)} color='light' className='ion-margin-vertical'>
            <IonInput onIonChange={(e)=>setDisplayName(e.detail.value!)} value={displayName} maxlength={15} placeholder='Enter Name'></IonInput>
           </IonItem>
           <IonToolbar color='none'>
            {
              <IonNote color='danger'>{error}</IonNote>
            }
           <IonNote slot='end'>
            <small>{displayName.length}/{15}</small>
           </IonNote>
           </IonToolbar> 
            
           </IonContent>
        </IonModal>

  )
}

export default UpdateDisplayNameModal