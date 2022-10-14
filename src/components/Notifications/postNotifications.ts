import { collection, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore"
import { doc } from "firebase/firestore"
import { Notification, PostInfo, User } from "../../Types/entitinities"
import { sendNotification } from "./notificationConfig"



export async function sendNotificationToMentions(text: string, post: PostInfo, user: User, notification: Notification) {
    const mentions = text.split(" ").filter((word => word[0] == '@'))
    const db = getFirestore()
    const id = post.id + "mention";


    const usersPromise = mentions.map(async (username) => {
        return getDocs(query(collection(db, 'users'), where('username', '==', username.substring(1))))
            .then((res) => {
                return res.docs.map(doc => doc.data())[0]
            }).catch(err => {
                console.log(err)
                return null
            })
    })

    const users: any[] = await Promise.all(usersPromise)

    console.log(users)




    users.map(async (u) => {
        if (!u || !u?.email) {
            return;
        }
        if (u.email === post.user?.email) {
            return;
        }
        notification = { ...notification, id, title: 'mentioned you', description: 'mentioned you' } as Notification
        if (u.email !== user.email) {
            const notificationRef = doc(db, `users/${u.email}/notifications`, id)
            await setDoc(notificationRef, notification)
            u && await sendNotification(notification, `${user.displayName || user.username} ${notification.title}`, u)
        }

    })



}