
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Verified Production Credentials
const firebaseConfig = {
  apiKey: "AIzaSyCzBkYhBVL8KDT-CUyc6eqHFpz9AHIsI1k",
  authDomain: "gen-lang-client-0320751781.firebaseapp.com",
  projectId: "gen-lang-client-0320751781",
  storageBucket: "gen-lang-client-0320751781.firebasestorage.app",
  messagingSenderId: "284184285704",
  appId: "1:284184285704:web:697ea4b8b5df66bdc477bd",
  measurementId: "G-3R75G2M1L0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore targeting the specific Named Database "sizzledatabasetest1"
// We use initializeFirestore to ensure settings (like polling) are applied to this specific instance.
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
}, "sizzledatabasetest1");

// Initialize Auth
const auth = getAuth(app);

// Initialize Storage
const storage = getStorage(app);

console.log("🔥 Firebase Config Loaded for Project:", firebaseConfig.projectId);
console.log("🗄️ Connected to Named Database: sizzledatabasetest1");

export { app, db, auth, storage };
