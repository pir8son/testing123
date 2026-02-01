
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? ""
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  throw new Error(
    `Missing Firebase config values: ${missingKeys.join(", ")}. ` +
      "Copy apps/web/.env.example to apps/web/.env.local and fill in your Firebase settings."
  );
}

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

// Initialize Analytics (Safe check)
let analytics;
try {
    analytics = getAnalytics(app);
} catch (e) {
    console.warn("Analytics failed to initialize (likely environment restriction):", e);
}

console.log("🔥 Firebase Config Loaded for Project:", firebaseConfig.projectId);
console.log("🗄️ Connected to Named Database: sizzledatabasetest1");

export { app, db, auth, storage, analytics };
