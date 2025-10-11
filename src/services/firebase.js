import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyD1335Pt--9yDvnK4j1aJSW2Simuo6mF3s",
  authDomain: "afretec-pulse.firebaseapp.com",
  projectId: "afretec-pulse",
  storageBucket: "afretec-pulse.firebasestorage.app",
  messagingSenderId: "412974491041",
  appId: "1:412974491041:web:1568cc345d25ed2ce2d7e0",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// Auth avec AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export default app;
