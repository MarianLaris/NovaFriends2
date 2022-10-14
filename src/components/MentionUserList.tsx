import { IonAvatar, IonCardContent, IonImg, IonItem, IonLabel, IonList } from '@ionic/react'
import { User } from '../Types/entitinities'
import React, { useEffect, useState } from 'react'
import { collection, getFirestore, limitToLast, orderBy, query, where } from 'firebase/firestore'
import { getDocs } from 'firebase/firestore'
import '../theme/Post.css';
import { Virtuoso } from 'react-virtuoso'

const MentionUserList: React.FC<{ changeText: string, setchangeText: (text: string) => void }> = ({ changeText, setchangeText }) => {

    const [matchedUsers, setMatchedUsers] = useState<User[]>([])
    const db = getFirestore()

    useEffect(() => {

        if (changeText) {
            getUserMatches()
        }




    }, [changeText])

    function getUserMatches() {
        const lastWord = changeText.split(' ')[changeText.split(' ').length - 1]
        const firstCharacter = lastWord[0]
        if (firstCharacter === "@") {
            const queryText = lastWord.substring(1, lastWord.length - 1)

            try {
                getDocs(query(collection(db, `users`), where('username', '>=', queryText)
                    , where('username', '<=', queryText + '\uf8ff'), orderBy('username', 'asc'), limitToLast(5))).then((result) => {
                        setMatchedUsers(result.docs.map((doc) => (doc.data() as User)))
                    })
            } catch (err) {
                console.log(err)
            }
        }
    }

    function updateText(user: User) {
        const lastWord = changeText.split(' ')[changeText.split(' ').length - 1]
        const wordsWihout = changeText.substring(0, changeText.length - lastWord.length - 1) + " "

        setchangeText(wordsWihout + '@' + user.username)
        setTimeout(() => {
            setMatchedUsers([])
        }, 800);


    }



    return (
        <div className='mention-user-list'>
            {matchedUsers.length > 0 && <IonList style={{ background: 'white', margin: 0, padding: 0 }}>
                <IonCardContent>
                    {matchedUsers.map((user, index) => {
                        return (
                            <IonItem onClick={() => updateText(user)} key={user.email}>
                                <IonAvatar className='Ion-avatar' slot="start">
                                    <IonImg src={user.photo} />
                                </IonAvatar>
                                <IonLabel>
                                    <h2>@{user.username}</h2>
                                    <p>{user.displayName || user.email}</p>
                                </IonLabel>
                            </IonItem>
                        )
                    })
                    }
                    {/* <IonItem style={{ height: "80px" }}>
                    </IonItem> */}
                </IonCardContent>
            </IonList>}
        </div>
    )
}

export default MentionUserList