import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDtlYRIK5rKZF5jt4jQDC-QluN16zreQ-A",
  authDomain: "kanban-board-aa452.firebaseapp.com",
  projectId: "kanban-board-aa452",
  storageBucket: "kanban-board-aa452.firebasestorage.app",
  messagingSenderId: "213498452912",
  appId: "1:213498452912:web:0f942bb1b7994c27af5475",
  measurementId: "G-WE2CXVQQ1Z"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();