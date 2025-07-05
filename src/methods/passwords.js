import { createUser, extendUser, getUser, checkIfUserExists, getUserId } from './database.js';
import { createRandomBase64URLString } from '../helpers/base64url.js'
import bcrypt from "bcryptjs";

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

async function verifyPassword(password, expectedHash) {
  return bcrypt.compareSync(password, expectedHash);
}



async function passwordRegister (username, password ,confirmPassword) {
  if (password !== confirmPassword) {
    throw new Error("passwords do not match")
  }
  await checkIfUserExists(username);
  const user = {
    userId: createRandomBase64URLString(),
    userName: username,
    password: hashPassword(password),
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
  const isValid = verifyPassword(password, user.password);
  if (!isValid) {
    throw new Error("Invalid password");
  }
  if (user.availableMethods["2FA"]) {
    return {
      "requires2FA": true,
      "userId": user.userId
    }
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
  const hashedPW = hashPassword(password)
  await extendUser(userId, {
    password: hashedPW, 
    updatedAt: new Date().toISOString(),
    "availableMethods": {...user.availableMethods, "password": true },
  })
  return {
    ...user,
    password: hashedPW, 
    updatedAt: new Date().toISOString(),
    "availableMethods": {...user.availableMethods, "password": true },
  }
}



export { passwordRegister, passwordLogin, addPassword }