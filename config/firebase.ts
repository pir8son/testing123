import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Verified Production Credentials
const firebaseConfig = {
  apiKey: "AIzaSyCzBkYhBVL8KDT-CUyc6eqHFpz9AHIsI1k",
  authDomain: "gen-lang-client-0320751781.firebaseapp.com",
  projectId: "gen-lang-client-0320751781",
  storageBucket: "gen-lang-client-0320751781.firebasestorage.app",
  messagingSenderId: "284184285704",
  appId: "1:284184285704:web:697ea4b8b5df66bdc477bd",
  measurementId: "G-3R75G2M1L0",
};

const app = initializeApp(firebaseConfig);

const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  "sizzledatabasetest1"
);

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

const storage = getStorage(app);

let analytics;
if (Platform.OS === "web") {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn("Analytics failed to initialize:", error);
  }
} else {
  console.info("Native Analytics disabled to prevent crash");
}

console.log("🔥 Firebase Config Loaded for Project:", firebaseConfig.projectId);
console.log("🗄️ Connected to Named Database: sizzledatabasetest1");

export { app, auth, db, storage, analytics };
