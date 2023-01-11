// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjUFtdC41yo4IgV951clX-KkXrEEKtNQQ",
  authDomain: "tickets-manager-5e638.firebaseapp.com",
  projectId: "tickets-manager-5e638",
  storageBucket: "tickets-manager-5e638.appspot.com",
  messagingSenderId: "961578891143",
  appId: "1:961578891143:web:dce8026c627eb8dff80522",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);
logEvent(analytics, 'notification_received');

export { app, auth, db, storage };