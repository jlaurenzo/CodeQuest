import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8ad02BozK8L2PLBtnCCxSaPc0YpbP1PY",
  authDomain: "code-quest-7191f.firebaseapp.com",
  projectId: "code-quest-7191f",
  storageBucket: "code-quest-7191f.firebasestorage.app",
  messagingSenderId: "3533858849",
  appId: "1:3533858849:web:840a7713234830730ddb60",
  measurementId: "G-F6JQ8ZZ0J4"
};

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);

const db = getFirestore(app);

export { auth, db };

