import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js'

const firebaseConfig = {
  apiKey: "AIzaSyBQrF1Cm-t9wiWGDXLTLMo4rw8sx21CGzc",
  projectId: "gama-authentication",
  appId: "1:780644758149:web:ae38f5e09aab8eb355efec",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createUser(options) {
  const { userId, userName } = options
  await setDoc(doc(db, "usernames", userName), {userId});
  await setDoc(doc(db, "users", userId), options)
}

async function storePasskey(options) {
  await setDoc(doc(db, "passkeys", options.credId), options);
}

async function getPasskey(credId) {
  const snapshot = await getDoc(doc(db, "passkeys", credId));
  if (snapshot.exists()) {
    return snapshot.data();
  } else {
    throw new Error("Passkey not found");
  }
}

async function extendUser(userId, options) {
  await updateDoc(doc(db, "users", userId), options);
}

async function getUser(userId) {
  const snapshot = await getDoc(doc(db, "users", userId));
  if (snapshot.exists()) {
    return snapshot.data();
  } else {
    throw new Error("User not found");
  }
}

async function getUserId(username) {
  const snapshot = await getDoc(doc(db, "usernames", username));
  if (snapshot.exists()) {
    return snapshot.data();
  } else {
    throw new Error("Username not found");
  }
}

async function checkIfUserExists(username) {
  const snapshot = await getDoc(doc(db, "usernames", username));
  if (snapshot.exists()) {
    throw new Error("Username already exists");;
  } else {
    return;
  }
}

async function createSession(sessionId, options) {
  await setDoc(doc(db, "sessions", sessionId), options);
}

async function getSession(sessionId) {
  const snapshot = await getDoc(doc(db, "sessions", sessionId));
  if (snapshot.exists()) {
    return snapshot.data();
  } else {
    throw new Error("Session not found");
  }
}

async function removeSession(sessionId) {
  await deleteDoc(doc(db, "sessions", sessionId));
}


export { createUser, extendUser, getUser, checkIfUserExists, getUserId, storePasskey, getPasskey, createSession, getSession, removeSession }