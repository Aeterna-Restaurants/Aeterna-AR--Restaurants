import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC2FCJmKXCg5nmQj8t9n-vTAIG7tsIRJ9I",
  authDomain: "aeterna-ar-restaurants.firebaseapp.com",
  projectId: "aeterna-ar-restaurants",
  storageBucket: "aeterna-ar-restaurants.firebasestorage.app",
  messagingSenderId: "606685999055",
  appId: "1:606685999055:web:0f9adf620ea9d565e8ecba",
  measurementId: "G-B8STFGLH47"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const storage = getStorage(app);

