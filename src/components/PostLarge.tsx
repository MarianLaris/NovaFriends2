import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    useIonRouter,
    IonCardContent,
    useIonAlert,
    IonProgressBar,
    IonItem,
    IonPopover,
    IonLabel,
    useIonToast,
    useIonViewDidEnter,
    useIonViewDidLeave,
    useIonViewWillEnter,
    useIonViewWillLeave,
    useIonActionSheet,
    IonImg,
    IonFooter
} from '@ionic/react';
import { chevronBackOutline, heartOutline, chatbubbleEllipsesOutline, heart, ellipsisVertical, trashOutline, banOutline, timeOutline } from 'ionicons/icons';
import { useEffect, useState, useContext, useRef } from 'react';
import { useHistory } from 'react-router';
import '../theme/Post.css';
import { Comment, Notification, PostInfo, PostLike, User } from '../Types/entitinities';
import UIContext from "../Roots/TabsContext";
import 'animate.css'
import { collection, deleteDoc, doc, getFirestore, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectUser } from '../state/userState';
import { genId } from '../pages/NewPost';
import tFormatter from './TimeFormat';
import nFormatter from './NumberFormat';
import { sendNotification } from './Notifications/notificationConfig';
import MentionUserList from './MentionUserList';
import { sendNotificationToMentions } from './Notifications/postNotifications';
import React from 'react';
import { verified } from "../assets/assets"



const Post: React.FC = () => {

    const history = useHistory();
    const router = useIonRouter()
    const { setShowTabs } = useContext(UIContext);
    const [comments, setcomments] = useState<Comment[]>([])
    const user: User = useSelector(selectUser)
    const [showAlert, dismissAlert] = useIonAlert()
    const db = getFirestore()
    const [commentText, setcommentText] = useState<string>("")
    const [loading, setloading] = useState<boolean>(false)
    const [meLiked, setmeLiked] = useState<boolean>(false);
    const [likes, setlikes] = useState<PostLike[]>([])
    const [liking, setliking] = useState<boolean>(false)
    const [post, setPostInfo] = useState<PostInfo>()
    const content = useRef<HTMLIonContentElement>(null)
    const popover = useRef<HTMLIonPopoverElement>(null)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [showToast, dissmissToast] = useIonToast()
    const [showSheet, dissmissSheet] = useIonActionSheet()
    const [showCommentBar, setShowCommentBar] = useState(true)

    let commentBarStyle = showCommentBar ? undefined : { display: "none" };




    useIonViewWillEnter(() => {
        setShowTabs(false);
        setShowCommentBar(true)
    })

    useIonViewWillLeave(() => {
        setTimeout(() => {
            setShowTabs(true);
        }, 0);
        setShowCommentBar(false)
    })

    function backClick() {
        return (
            router.goBack()
        )
    }

    function scrollPage() {
        content.current?.scrollToBottom()
    }

    useEffect(() => {
        const state = history.location.state as { post: PostInfo, postId: string, comment?: boolean }
        if (state?.postId) {
            getUpdatedPostFromId(state.postId)
            return;
        }
        else if (state && state?.post) {

            try {
                setPostInfo(state.post)
                getComments(state.post)
                getUpdatedPost(state.post)
                getLikes(state.post)
                verifyIfLiked(state.post)
            } catch (err: any) {
                showAlert({ message: err.message, buttons: ['ok'] })
            }

        }
    }, [])

    function getUpdatedPost(post: PostInfo) {

        onSnapshot(doc(db, "posts", post.id), snapshot => {
            const postInfo: PostInfo = snapshot.data() as PostInfo
            postInfo.id && setPostInfo(postInfo)
        }
        )
    }

    function getUpdatedPostFromId(postId: string) {

        onSnapshot(doc(db, "posts", postId), snapshot => {
            const postInfo: PostInfo = snapshot.data() as PostInfo
            setPostInfo(postInfo)
            getLikes(postInfo)
            verifyIfLiked(postInfo)
            setPostInfo(postInfo)
            getComments(postInfo)
        }
        )
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

    // verify if email is in array of PostLikes
    function verifyIfLiked(post: PostInfo) {
        const postRef = collection(db, `posts/${post.id}/likes`)
        onSnapshot(postRef, (snapshot) => {
            const likes: PostLike[] = []
            snapshot.docs.map((doc) => {
                const like = doc.data() as PostLike
                if (like.email === user.email) {
                    setmeLiked(true)
                }
            })
        });
    }

    function getComments(post: PostInfo) {
        const postRef = query(collection(db, `posts/${post.id}/comments`), orderBy("timestamp", "asc"))
        onSnapshot(postRef, (snapshot) => {
            const comments: Comment[] = []
            snapshot.docs.map((doc) => {
                const comment = doc.data() as Comment
                comments.push(comment)
                const state = history.location.state as { post: PostInfo, postId: string, comment?: boolean }
                if (state.comment) {
                    content.current?.scrollToBottom()
                }
            })
            setcomments(comments)
        });
    }

    const uploadComment = async () => {
        const id = genId();


        if (!user.email) {
            await showAlert({ message: "Please Login to continue" })
            return
        }
        if (post) {

            try {
                const postRef = doc(db, `posts`, post.id)
                const commentRef = doc(db, `posts/${post.id}/comments`, id)
                const notificationRef = doc(db, `users/${post.user?.email}/notifications`, id)
                const comment: Comment = {
                    description: commentText,
                    id,
                    user: user,
                    attachment: '',
                    timestamp: Date.now()
                }
                const notification: Notification = {
                    id,
                    description: commentText,
                    from: user,
                    title: `commented on your post`,
                    timestamp: Date.now(),
                    type: 'comment',
                    postId: post.id,
                    seen: false,

                }
                setloading(true)
                await setDoc(postRef, { ...post, comments: (post.comments || 0) + 1 })
                await setDoc(commentRef, comment)

                if (user.email !== post.user?.email) {
                    await setDoc(notificationRef, notification)
                }
                setcommentText("")
                setloading(false)

                content.current?.scrollToBottom()

                if (post.user?.email !== user.email) {
                    post.user && await sendNotification(notification, `${user.displayName || user.username} ${notification.title}`, post.user)
                }
                await sendNotificationToMentions(commentText, post, user, notification)


            } catch (err: any) {
                showAlert({ message: err.message, buttons: ['ok'] })
            }
            setloading(false)

        }
    }

    const likePost = async () => {
        if (!user.email) {
            await showAlert({ message: "Please Login to continue" })
            return
        }
        if (post) {
            const postRef = doc(db, `posts`, post.id)
            const likeRef = doc(db, `posts/${post.id}/likes`, user.email)
            const like: PostLike = {
                email: user.email,
                user: user,
                timestamp: Date.now()
            }
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
            const notificationRef = doc(db, `users/${post.user?.email}/notifications`, notification.id)

            try {
                setliking(true)
                await setDoc(likeRef, like)
                if (user.email !== notification.from?.email) {
                    await setDoc(notificationRef, notification)
                }
                await setDoc(postRef, { ...post, likes: (post.likes || 0) + 1 })
                post.user && await sendNotification(notification, `${user.displayName || user.username} ${notification.title}`, post.user)

                setmeLiked(true)
            } catch (err: any) {
                showAlert({ message: err.message, buttons: ['ok'] })
            }
            setliking(false)
        }
    }

    const unlikePost = async () => {
        if (!user) {
            await showAlert({ message: "Please Login to continue" })
            return
        }
        if (post) {
            const postRef = doc(db, `posts`, post.id)
            const likeRef = doc(db, `posts/${post.id}/likes`, user.email)
            const notificationRef = doc(db, `users/${post.user?.email}/notifications`, user.email + post.id)
            setliking(true)
            try {
                await deleteDoc(likeRef)
                if (user.email !== post.user?.email) {
                    await deleteDoc(notificationRef)
                }
                await setDoc(postRef, { ...post, likes: (post.likes || 0) - 1 })
                setmeLiked(false)

            } catch (err: any) {
                showAlert({ message: err.message, buttons: ['ok'] })
            }
            setliking(false)
        }
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


    const openPopover = (e: any) => {
        popover.current!.event = e;
        setPopoverOpen(true);
    };

    async function deletePost(post: any) {
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
                        setPopoverOpen(false)
                    }
                }
            ]
        })

    }

    async function reportPost() {
        dismissAlert()
        if (!post?.username) {
            return;
        }
        await showSheet({
            header: 'Report Post',
            buttons: [
                { text: 'Inappropriate  Content', handler: () => { uploadReportStatus('Inappropriate  Content') } },
                // { text: 'Inappropriate  Behavior', handler: () => { uploadReportStatus('Inappropriate Behavior') } },
                // { text: 'Other', handler: () => { uploadReportStatus('Other') } },
            ]
        })

    }

    async function uploadReportStatus(value: string) {
        dismissAlert()
        setPopoverOpen(false)
        if (!post?.user) {
            return;
        }
        const report = {
            id: post?.id + user.email,
            reporter: user,
            reported_post: post,
            type: value,
            timestamp: Date.now(),
        }

        showToast(`@${post.user?.username}'s post has been reported`, 2000)
        const reportRef = doc(db, `reports/${report.id}`)
        await setDoc(reportRef, report)

    }


    return (

        <IonPage>

            {/* NavBar information. Need to add a settings IonButton. */}
            <IonHeader className="post--header">
                <IonToolbar>
                    {post?.user && <IonTitle className="post--header--name">@{user.email == post?.user.email ? user.username : post?.user?.username} <span>Post</span></IonTitle>}
                    <IonButtons className="home--btn--container" slot="secondary">
                        <IonButton onClick={backClick} routerDirection="back" color="dark">
                            <IonIcon size="large" slot="start" icon={chevronBackOutline} />
                        </IonButton>
                    </IonButtons>

                    <IonButtons className="home--btn--container" slot="primary">
                        <IonButton onClick={openPopover} className='option--button' slot='end' fill='clear'>
                            <IonIcon icon={ellipsisVertical}></IonIcon>
                        </IonButton>
                    </IonButtons>
                    <IonPopover ref={popover} isOpen={popoverOpen} onDidDismiss={() => setPopoverOpen(false)}>
                        <IonContent>
                            {user.email == post?.user?.email && <IonItem onClick={() => { setPopoverOpen(false); deletePost(post) }} lines='none' button>
                                <IonIcon size='small' icon={trashOutline} slot='start'></IonIcon>
                                <IonLabel>Delete Post</IonLabel>
                            </IonItem>
                            }
                            <IonItem lines='none' button onClick={() => { setPopoverOpen(false); reportPost() }}>
                                <IonIcon color='danger' size='small' icon={banOutline} slot='start'></IonIcon>
                                <IonLabel color='danger'>Report Post</IonLabel>
                            </IonItem>

                        </IonContent>
                    </IonPopover>
                </IonToolbar>
                {loading && <IonProgressBar type="indeterminate" color='tertiary' ></IonProgressBar>}
            </IonHeader>

            {/* Initiate the rest of the page content, excluding the bottom tabs. */}
            <IonContent ref={content} fullscreen>


                {/* Div for an entire post */}
                <div className="post--large--container">


                    {/* Div for the post picture */}
                    <div className="picture--container">
                        <IonImg src={post?.image} />
                        <div className='post-time-stamp'>
                            <IonIcon size="small" icon={timeOutline} />
                            <div>{tFormatter((Date.now() - (post?.createdAt ? post?.createdAt : 0)) / 1000, 0)}</div>
                        </div>
                    </div>


                    {/* Div for all the info below the post pic */}
                    <div className="post--container">
                        {/* Buttons */}
                        <div className="buttons--container">

                            {/* BUTTONS LEFT */}
                            <div className="button--container--left">
                                <IonButtons slot="primary">
                                    {!meLiked && <IonButton disabled={liking} onClick={likePost} color="dark" >
                                        <IonIcon size="large" slot="start" icon={heartOutline} />
                                    </IonButton>}
                                    {meLiked && <IonButton disabled={liking} onClick={unlikePost} color="danger" >
                                        <IonIcon size="large" slot="start" icon={heart} />
                                    </IonButton>}
                                    <IonButton color="dark">
                                        <IonIcon size="large" slot="end" icon={chatbubbleEllipsesOutline} />
                                    </IonButton>
                                </IonButtons>
                            </div>

                            {/* BUTTONS RIGHT */}
                            <div className="button--container--right">
                                <IonButtons slot="secondary">
                                    <IonButton onClick={() => history.push('/likespostlarge', { post, likes })} className="likes--button right--buttons" color="dark">
                                        {likeLength()}
                                    </IonButton>
                                    <IonButton className="likes--button right--buttons" color="dark">
                                        {commentLength()}
                                    </IonButton>
                                </IonButtons>
                                {/* <p>{`${nFormatter(comments.length, 1)} Comments`}</p> */}
                            </div>

                        </div>

                        {/* DESCRIPTION */}
                        <p className="image--description">
                            <span className="username--image--description">{user.email == post?.user?.email ? user.username : post?.user?.username}</span> {post?.description}
                        </p>
                    </div>


                    {/* All THE COMMENTS */}

                    <div className="all--comments--container">
                        {/* <h1>Comments</h1> */}

                        {/* 1 COMMENT 1 */}
                        {
                            comments.map((comment, index) => {
                                if (!comment.user.email) {
                                    return <></>
                                }
                                return (
                                    <CommentBlock comment={comment}></CommentBlock>
                                )
                            })
                        }


                    </div>
                </div>

                
            </IonContent>
                <IonFooter>
                    <div style={commentBarStyle} className='comment--footer'>
                        <div className='comment--footer--inside--wrapper'>
                            <input style={{ color: "black" }} onFocus={scrollPage} value={commentText} onChange={(e) => setcommentText(e.target.value)} className='post--comment--input' placeholder='Comment'></input>
                            <IonButton onClick={uploadComment} className='post--comment--button' fill='clear'>Drop!</IonButton>
                        </div>
                    </div>
                </IonFooter>
            <MentionUserList changeText={commentText} setchangeText={setcommentText} />
        </IonPage >
    );
};

export const CommentBlock: React.FC<{ comment: Comment }> = ({ comment }) => {
    const history = useHistory()
    const user: User = useSelector(selectUser)
    const [verifiedMember, setVerifiedMember] = useState(['bengorski', 'cam']);

    return (
        <div className="comment--container">
            <div className="pic--wrapper">
                <IonImg className="pic--comment" src={comment.user.photo} />
            </div>
            <div className="post--username--container">
                <IonButton class="post--username" onClick={() => { user.email == comment.user?.email ? history.push("/profile") : history.push("/UserProfile", { user: comment.user }) }} fill="clear">
                    <span>@{user.email == comment?.user?.email ? user.username : comment?.user?.username}</span>
                </IonButton>
                {verifiedMember.includes(`${comment.user?.username}`) ? <img height={15} width={15} src={verified} /> : ''}
            </div>
            <div className="time">
                <p>
                    {tFormatter((Date.now() - comment.timestamp) / 1000, 0)}
                </p>
            </div>
            <div className="comment">
                <p>{comment.description}</p>
            </div>
        </div>
    )
}


export default Post;