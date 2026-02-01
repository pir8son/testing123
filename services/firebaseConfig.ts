
// Import the functions you need from the SDKs you need
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth, initializeAuth } from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth/react-native";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

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

// Initialize Auth with persistence in React Native
const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

// Initialize Storage
const storage = getStorage(app);

// Initialize Analytics (web-only)
let analytics;
if (Platform.OS === "web") {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("Analytics failed to initialize (likely environment restriction):", e);
  }
} else {
  console.info("Native Analytics disabled to prevent crash");
}

console.log("🔥 Firebase Config Loaded for Project:", firebaseConfig.projectId);
console.log("🗄️ Connected to Named Database: sizzledatabasetest1");

export { app, db, auth, storage, analytics };
