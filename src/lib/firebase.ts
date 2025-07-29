
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "ummahconnect-po02n",
  "appId": "1:697048800724:web:89110d7a716715f4214a41",
  "storageBucket": "ummahconnect-po02n.appspot.com",
  "apiKey": "AIzaSyDFxK2YV9zU9Dqf8T0_J3d2j4l5k6n7m8",
  "authDomain": "ummahconnect-po02n.firebaseapp.com",
  "messagingSenderId": "697048800724",
  "measurementId": "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
