
// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth, initializeAuth } from "firebase/auth";
import { getReactNativePersistence } from "firebase/auth/react-native";
import { getStorage } from "firebase/storage";
import { getAnalytics, type Analytics } from "firebase/analytics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

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
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Initialize Firestore targeting the specific Named Database "sizzledatabasetest1"
// We use initializeFirestore to ensure settings (like polling) are applied to this specific instance.
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
}, "sizzledatabasetest1");

// Initialize Auth
const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : (() => {
        try {
          return initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
          });
        } catch (error) {
          console.warn("Auth already initialized, falling back to getAuth.", error);
          return getAuth(app);
        }
      })();

// Initialize Storage
const storage = getStorage(app);

// Initialize Analytics (Safe check)
let analytics: Analytics | undefined;
if (Platform.OS === "web") {
  analytics = getAnalytics(app);
} else {
  console.log("Firebase initialized (Native Mode)");
}

console.log("🔥 Firebase Config Loaded for Project:", firebaseConfig.projectId);
console.log("🗄️ Connected to Named Database: sizzledatabasetest1");

export { app, db, auth, storage, analytics };
