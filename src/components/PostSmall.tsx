
import { IonContent, IonButtons, IonButton, IonIcon, useIonAlert, IonPopover, IonItem, IonLabel, useIonToast, IonImg } from '@ionic/react';
import { doc, onSnapshot, orderBy, query, setDoc, where } from 'firebase/firestore';
import { heartOutline, chatbubbleEllipsesOutline, heart, ellipsisVertical, trashOutline, timeOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { selectUser } from '../state/userState';
import '../theme/Home-Discover.css';
import { Notification, PostInfo, PostLike, User } from '../Types/entitinities';
import nFormatter from './NumberFormat';
import tFormatter from './TimeFormat';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { deleteDoc, collection, getFirestore } from 'firebase/firestore';
import { auth } from '../pages/firebase-config';
import { sendNotification } from './Notifications/notificationConfig';
import { verified } from "../assets/assets"



// // Props:
// username
// profile_pic
// picture
// likes 
// comments
// description

export default function RenderHomePagePosts(props: { post: PostInfo }) {
    const user: User = useSelector(selectUser)
    const { post } = props;
    const history = useHistory();
    const dispatch = useDispatch()
    const [userLikes, setuserLikes] = useState(false)
    const [liking, setliking] = useState(false)
    const [comments, setcomments] = useState<Comment[]>([])
    const [likes, setlikes] = useState<PostLike[]>([])
    const [showAlert, dismissAlert] = useIonAlert()
    const [showToast, dismissToast] = useIonToast()
    const db = getFirestore()
    const popover = useRef<HTMLIonPopoverElement>(null)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [verifiedMember, setVerifiedMember] = useState(['bengorski', 'cam']);




    function commentPost() {
        history.push('/post', { post: post, comment: true })

    }

    function viewPost() {
        history.push('/post', { post: post })
    }

    useEffect(() => {
        verifyIfLiked()
        getLikes(post)
        getComments(post)
    }, [])

    const openPopover = (e: any) => {
        popover.current!.event = e;
        setPopoverOpen(true);
    };

    function verifyIfLiked() {
        if (auth.currentUser?.email) {
            onSnapshot(query(collection(db, `posts/${post.id}/likes`), where("user.email", "==", auth.currentUser.email)), (docs => {
                setuserLikes(docs.docs.length > 0)
            }))
        }
    }

    function getLikes(post: PostInfo) {
        const postRef = collection(db, `posts/${post.id}/likes`)
        onSnapshot(postRef, (snapshot) => {
            const likes: PostLike[] = []
            snapshot.docs.map((doc) => {
                const like = doc.data() as PostLike
                likes.push(like)
            })
            setlikes(likes)
        });
    }

    function getComments(post: PostInfo) {
        const postRef = query(collection(db, `posts/${post.id}/comments`), orderBy("timestamp", "desc"))
        onSnapshot(postRef, (snapshot) => {
            const comments: Comment[] = []
            snapshot.docs.map((doc) => {
                const comment = doc.data() as Comment
                comments.push(comment)
            })
            setcomments(comments)
        });
    }

    async function likePost() {
        const notificationRef = doc(db, `users/${post.user?.email}/notifications`, user.email + post.id)

        const notification: Notification = {
            id: user.email + post.id,
            description: '',
            from: user,
            title: `liked your post`,
            timestamp: Date.now(),
            type: 'like',
            postId: post.id,
            seen: false,

        }

        const likeData: PostLike = {
            email: user.email,
            user: user,
            timestamp: Date.now()
        }
        setliking(true)
        try {
            if (user.email !== post.user?.email) {
                await setDoc(notificationRef, notification)
            }
            await setDoc(doc(db, `posts/${post.id}/likes`, user.email), likeData)
            post.user && await sendNotification(notification, `${user.displayName || user.username} ${notification.title}`, post.user)
        }
        catch (e: any) {
            showAlert({ header: "Error", message: "Error liking post. " + e.message, buttons: [{ text: "OK", role: "cancel" }] })
        }
        setliking(false)
    }

    async function unlikePost() {
        setliking(true)
        try {
            if (user.email !== post.user?.email) {
                await deleteDoc(doc(db, `posts/${post.id}/notifications`, user.email + post.id))
            }
            await deleteDoc(doc(db, `posts/${post.id}/likes`, user.email))
        }
        catch (e: any) {
            showAlert({ header: "Error", message: "Error unliking post. " + e.message, buttons: [{ text: "OK", role: "cancel" }] })
        }
        setliking(false)
    }

    async function deletePost() {
        showAlert({
            header: 'Delete Post', message: 'Are you sure you want to delete this post?', buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: "Delete",
                    cssClass: 'delete--button',
                    handler: async () => {
                        await deleteDoc(doc(db, `posts/${post.id}`))
                        await deleteDoc(doc(db, `users/${user.email}/posts`, post.id))
                        showToast({ message: "Post Deleted", duration: 2000 })
                    }
                }
            ]
        })
    }

    const likeLength = () => {
        if (likes.length === 1) {
            return `${nFormatter(likes.length, 1)} Like`
        }
        else {
            return `${nFormatter(likes.length, 1)} Likes`
        }
    }

    const commentLength = () => {
        if (comments.length === 1) {
            return `${nFormatter(comments.length, 1)} Comment`
        }
        else {
            return `${nFormatter(comments.length, 1)} Comments`
        }
    }

    return (
        <div className="post--container ">
            <div className="post--topbar--container">
                <div className="username--container">
                    <IonImg className="small--user--profile--pic" src={post.user?.photo || ""} />
                    <IonButton onClick={() => { user.email == post.user?.email ? history.push("/profile") : history.push("/UserProfile", { user: post.user }) }} className="username--image--tag" fill="clear">
                        <span className="username--image--tag--span">@{post.user?.username || post.username}</span>
                    </IonButton>
                    {verifiedMember.includes(`${post.user?.username}`) ? <img height={15} width={15} src={verified} /> : ''}
                </div>

                {user.email == post.user?.email && <>
                    <IonButton onClick={openPopover} className='option--button' slot='end' fill='clear'>
                        <IonIcon icon={ellipsisVertical}></IonIcon>
                    </IonButton>
                    <IonPopover ref={popover} isOpen={popoverOpen} onDidDismiss={() => setPopoverOpen(false)}>
                        <IonContent class="ion-padding">
                            <IonItem onClick={() => { setPopoverOpen(false); deletePost() }} lines='none' button>
                                <IonIcon size='small' icon={trashOutline} slot='start'></IonIcon>
                                <IonLabel>Delete Post</IonLabel>
                            </IonItem>
                        </IonContent>
                    </IonPopover>
                </>

                }

            </div>


            {post.image && <div onClick={viewPost} className="picture--container">
                <IonImg src={post.image} />
                <div className='post-time-stamp'>
                    <IonIcon size="small" icon={timeOutline} />
                    <div>{tFormatter((Date.now() - post.createdAt) / 1000, 0)}</div>
                </div>
            </div>}
            {post.video && <div className="picture--container">
                <video src={post.video} />
            </div>}

            <div className="info--container">
                <div className="buttons--container">


                    <div className="button--container--left">
                        <IonButtons slot="primary">
                            {!userLikes && <IonButton disabled={liking} onClick={likePost} color="dark">
                                <IonIcon size="large" slot="start" icon={heartOutline} />
                            </IonButton>}
                            {userLikes && <IonButton disabled={liking} onClick={unlikePost} color="danger" >
                                <IonIcon size="large" slot="start" icon={heart} />
                            </IonButton>}
                            <IonButton className="icon--buttons" onClick={commentPost} color="dark">
                                <IonIcon size="large" slot="end" icon={chatbubbleEllipsesOutline} />
                            </IonButton>
                        </IonButtons>
                    </div>

                    <div className="button--container--right">
                        {/* <p>{`${nFormatter(likes.length, 1)} Likes`}</p> */}
                        <IonButtons slot="secondary">
                            <IonButton onClick={() => history.push('/likes', { post, likes })} className="likes--button right--buttons likes" fill='clear'>
                                {likeLength()}
                            </IonButton>
                            <IonButton onClick={commentPost} className="likes--button right--buttons" fill='clear'>
                                {commentLength()}
                            </IonButton>
                        </IonButtons>
                    </div>
                </div>

                <p className="image--description">
                    <span className="username--image--description">
                        {post.username}
                    </span>
                    {" "}{post.description}
                </p>
            </div>

        </div>
    )
};