import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

const getBoardRef = (userId) => doc(db, "boards", userId);

export const fetchBoard = async (userId) => {
  const snapshot = await getDoc(getBoardRef(userId));
  if (snapshot.exists()) return snapshot.data();
  return { todo: [], inProgress: [], done: [] };
};

export const saveBoard = async (userId, boardState) => {
  await setDoc(getBoardRef(userId), boardState, { merge: true });
};

export const subscribeToBoard = (userId, callback) => {
  return onSnapshot(getBoardRef(userId), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    } else {
      callback({ todo: [], inProgress: [], done: [] });
    }
  });
};