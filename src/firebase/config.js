import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";

// Replace these values with your Firebase project config
// Firebase Console → Project Settings → Your apps → SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8HYYVzPPGxnB-rCV6DwNcVJ4EdyejSVE",
  authDomain: "smarthomesystem-a5ad1.firebaseapp.com",
  projectId: "smarthomesystem-a5ad1",
  storageBucket: "smarthomesystem-a5ad1.firebasestorage.app",
  messagingSenderId: "671157746111",
  appId: "1:671157746111:web:bf81c64940384618e9c90a",
  measurementId: "G-48FQT0X7LW",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
