import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA8HYYVzPPGxnB-rCV6DwNcVJ4EdyejSVE",
  authDomain: "smarthomesystem-a5ad1.firebaseapp.com",
  databaseURL: "https://smarthomesystem-a5ad1-default-rtdb.firebaseio.com",
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

export const db = getFirestore(app);
export const rtdb = getDatabase(app);

