import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, addDoc, doc, getDoc, updateDoc, setDoc } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js'

const firebaseConfig = {
  apiKey: "AIzaSyBQrF1Cm-t9wiWGDXLTLMo4rw8sx21CGzc",
  projectId: "gama-authentication",
  appId: "1:780644758149:web:ae38f5e09aab8eb355efec",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createUser(options) {
  const { userId, username } = options
  try {
    await setDoc(doc(db, "usernames", username), {userId});
    await setDoc(doc(db, "users", userId), options)
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

async function extendUser(userId, options) {
  try {
    await updateDoc(doc(db, "users", userId), options);
  } catch (e) {
    console.error("Error updating user: ", e);
  }
  
}

async function getUser(userId) {
  try {
    const snapshot = await getDoc(doc(db, "users", userId));
    if (snapshot.exists()) {
      return snapshot.data();
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error getting user: ", e);
    return null;
  }
}

async function getUserId(username) {
  try {
    const snapshot = await getDoc(doc(db, "usernames", username));
    if (snapshot.exists()) {
      return snapshot.data();
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error getting userId: ", e);
    return null;
  }
}

async function checkIfUserExists(username) {
  try {
    console.log("CHeckpoint2")
    const snapshot = await getDoc(doc(db, "usernames", username));
    if (snapshot.exists()) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.error("Error checking username: ", e);
    return false;
  }
}


export { createUser, extendUser, getUser, checkIfUserExists, getUserId }