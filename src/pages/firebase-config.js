
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { getAuth, indexedDBLocalPersistence, initializeAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";


export const firebaseConfig = {
  apiKey: "AIzaSyBiXtt-KZBFYJPHrzyB45jtGxaJf62pWyU",
  authDomain: "novafriends-3cb8c.firebaseapp.com",
  projectId: "novafriends-3cb8c",
  storageBucket: "novafriends-3cb8c.appspot.com",
  messagingSenderId: "973388582038",
  appId: "1:973388582038:web:11b427942310e3efbb86b7",
  measurementId: "G-1KBMBD88R0"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let auth = initializeAuth(app,{
  persistence:indexedDBLocalPersistence
})
const storage = getStorage(app);

export {db, auth, storage}
