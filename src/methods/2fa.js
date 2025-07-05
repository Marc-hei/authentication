import { createUser, storePasskey, extendUser, getUser, getPasskey, checkIfUserExists, getUserId } from './database.js';

async function add2FA(userId) {
  // Replace this with your real 2FA setup logic
  // E.g., show QR code, bind TOTP secret, etc.
  const user = await getUser(userId);
  if (user.availableMethods["2FA"]) {
      throw new Error("User already has 2FA enabled");
  }
  await extendUser(userId, { 
    updatedAt: new Date().toISOString(),
    "availableMethods": {...user.availableMethods, "2FA": true },
  })
  return {
    ...user,
    updatedAt: new Date().toISOString(),
    availableMethods: {...user.availableMethods, "2FA": true },
  }
}

export { add2FA }