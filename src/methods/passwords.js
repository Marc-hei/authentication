import { createUser, storePasskey, extendUser, getUser, getPasskey, checkIfUserExists, getUserId } from './database.js';
import { stringToBase64URLString } from '../helpers/base64url.js';

const salt = "1saltmy2"

async function hashPassword(password) {
  const data = new TextEncoder().encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

async function verifyPassword(password, expectedHash) {
  const hash = await hashPassword(password, salt);
  return hash === expectedHash;
}

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function passwordRegister (username, password ,confirmPassword) {
  if (password !== confirmPassword) {
    throw new Error("passwords do not match")
  }
  await checkIfUserExists(username);
  const userId = stringToBase64URLString(crypto.randomUUID());
  const user = {
    userId: userId,
    userName: username,
    password: await hashPassword(password),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    availableMethods: {"passkey": false, "password": true, "2FA": false},
  }
  await createUser(user)
  return user;
}

async function passwordLogin (username, password) {
  const { userId } = await getUserId(username);
  const user = await getUser(userId);
  if (!user.availableMethods.password) {
      throw new Error("User does not have password enabled");
  }
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    throw new Error("Invalid password");
  }
  return user;
}

async function addPassword (userId, password, confirmPassword) {
  if (password !== confirmPassword) {
    throw new Error("passwords do not match")
  }
  const user = await getUser(userId);
  if (user.availableMethods.password) {
      throw new Error("User already has password enabled");
  }
  await extendUser(userId, {
    password: await hashPassword(password), 
    updatedAt: new Date().toISOString(),
    "availableMethods": {...user.availableMethods, "password": true },
  })
  return {
    ...user,
    password: await hashPassword(password), 
    updatedAt: new Date().toISOString(),
    "availableMethods": {...user.availableMethods, "password": true },
  }
}



export { passwordRegister, passwordLogin, addPassword }