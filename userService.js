// services/userService.js
import { get, ref, set } from "firebase/database";
import { database } from "../firebaseConfig";

export const createUserProfile = async (uid, userData) => {
  const userRef = ref(database, `users/${uid}`);
  await set(userRef, userData);
};

export const getUserProfile = async (uid) => {
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    return snapshot.val();
  }

  return null;
};
