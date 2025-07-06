import { createUser, storePasskey, extendUser, getUser, getPasskey, checkIfUserExists, getUserId } from './database.js';
import { base64URLStringToBuffer, bufferToBase64URLString } from '../helpers/base64url.js';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { setSessionCookie } from './cookie.js';

const RPID = import.meta.env.VITE_RPID;
const RPNAME = import.meta.env.VITE_RPNAME;
const EXPECTEDORIGIN = import.meta.env.VITE_EXPECTEDORIGIN;
let challenges = {};

async function passkeyRegisterStart (username) {
    await checkIfUserExists(username);
    const options = await generateRegistrationOptions({
        rpID: RPID,
        rpName: RPNAME,
        userName: username
    })
    challenges[username] = options.challenge;
    return options;
};

async function passkeyRegisterFinish (userId, username, credential) {
    const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: challenges[username],
        expectedOrigin: EXPECTEDORIGIN
    });
    const { verified, registrationInfo } = verification;
    if (!verified) {
        throw new Error("verification unsuccessful")
    }

    const user = {
        userId: userId,
        userName: username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        availableMethods: {"passkey": true, "password": false, "2FA": false},
        passkeys: [credential.id],
    }
    const passkey = {
        "credId": registrationInfo.credential.id,
        "credential": {
            id: registrationInfo.credential.id,
            publicKey: bufferToBase64URLString(registrationInfo.credential.publicKey),
            counter: registrationInfo.credential.counter,
            transports: registrationInfo.credential.transports,
        },
        "userId": userId,
        "aaguid": registrationInfo.aaguid,
        "rpId": RPID,
        "createdAt": new Date().toISOString(),
        "updatedAt": new Date().toISOString(),
        "credentialDeviceType": registrationInfo.credentialDeviceType,
        "credentialBackedUp": registrationInfo.credentialBackedUp,
    }

    await storePasskey(passkey);
    await createUser(user);
    await setSessionCookie(userId);
    return user;
};

async function passkeyLoginStart(username) {
    const { userId } = await getUserId(username);
    const user = await getUser(userId);
    if (!user.availableMethods.passkey) {
        throw new Error("User does not have passkey enabled");
    }
    let allowCredentials = [];
    for (const credId of user.passkeys) {
        allowCredentials.push({id: credId, type:"public-key"});
    }
    const options = await generateAuthenticationOptions({
        rpID: RPID,
        allowCredentials: allowCredentials,
    })
    challenges[username] = options.challenge;
    return options;
};

async function passkeyLoginFinish (username, credential) {
    const { userId } = await getUserId(username);
    const user = await getUser(userId);
    if (!user.availableMethods.passkey) {
        throw new Error("User does not have passkey enabled");
    }
    const data = await getPasskey(credential.id);
    data.credential.publicKey = base64URLStringToBuffer(data.credential.publicKey);
    const verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge: challenges[username],
        expectedOrigin: EXPECTEDORIGIN,
        expectedRPID: RPID,
        credential: data.credential,
    });
    const { verified, authenticationInfo } = verification;
    if (!verified) {
        throw new Error("verification unsuccessful")
    }
    await setSessionCookie(userId)
    return user;
};

async function addPasskeyStart (userId) {
    const user = await getUser(userId);
    let excludeCredentials = [];
    for (const credId of user.passkeys) {
        excludeCredentials.push({id: credId, type:"public-key"});
    }
    const options = await generateRegistrationOptions({
        rpID: RPID,
        rpName: RPNAME,
        userName: user.userName,
        userID: base64URLStringToBuffer(userId),
        excludeCredentials: excludeCredentials
    })
    challenges[user.userName] = options.challenge;
    return options;
}

async function addPasskeyFinish (userId, credential) {
    const user = await getUser(userId);
    const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: challenges[user.userName],
        expectedOrigin: EXPECTEDORIGIN
    });
    const { verified, registrationInfo } = verification;
    if (!verified) {
        throw new Error("verification unsuccessful")
    }
    
    const passkey = {
        "credId": registrationInfo.credential.id,
        "credential": {
            id: registrationInfo.credential.id,
            publicKey: bufferToBase64URLString(registrationInfo.credential.publicKey),
            counter: registrationInfo.credential.counter,
            transports: registrationInfo.credential.transports,
        },
        "userId": userId,
        "aaguid": registrationInfo.aaguid,
        "rpId": RPID,
        "createdAt": new Date().toISOString(),
        "updatedAt": new Date().toISOString(),
        "credentialDeviceType": registrationInfo.credentialDeviceType,
        "credentialBackedUp": registrationInfo.credentialBackedUp,
    }
    
    await storePasskey(passkey);
    await extendUser(userId, {
        updatedAt: new Date().toISOString(),
        availableMethods: {...user.availableMethods, passkey:true},
        "passkeys": [...(user.passkeys || []), credential.id]
    });
    return {
        ...user,
        updatedAt: new Date().toISOString(),
        availableMethods: {...user.availableMethods, passkey:true},
        "passkeys": [...(user.passkeys || []), credential.id]
    };
    
}

export { passkeyRegisterStart, passkeyRegisterFinish, passkeyLoginStart, passkeyLoginFinish, addPasskeyFinish, addPasskeyStart }