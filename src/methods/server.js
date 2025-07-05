import { createUser, storePasskey, extendUser, getUser, getPasskey, checkIfUserExists, getUserId } from './database.js';
import { base64URLStringToBuffer, bufferToBase64URLString } from '../helpers/base64url.js';
const RPID = import.meta.env.VITE_RPID;
const RPNAME = import.meta.env.VITE_RPNAME;
const EXPECTEDORIGIN = import.meta.env.VITE_EXPECTEDORIGIN;
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';


let users = {};
let challenges = {};

async function registerStart (username) {
    await checkIfUserExists(username);
    const options = await generateRegistrationOptions({
        rpID: RPID,
        rpName: RPNAME,
        userName: username
    })
    challenges[username] = options.challenge;
    return options;
};

async function registerFinish (userId, username, credential) {
    const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: challenges[username],
        expectedOrigin: EXPECTEDORIGIN
    });
    const { verified, registrationInfo } = verification;

    await createUser({
        userId: userId,
        userName: username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        availableMethods: {"passkey": true, "password": false, "2FA": false},
        passkeys: [credential.id],
    })
    await storePasskey(({
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
    }))
    return verified;
};

async function loginStart(username) {
    const { userId } = await getUserId(username);
    const user = await getUser(userId);
    if (!user.availableMethods.passkey) {
        throw new Error("User does not have passkey enabled");
    }
    let allowCredentials = [];
    for (const credId of user.passkeys) {
        allowCredentials.push({id: credId});
    }
    const options = await generateAuthenticationOptions({
        rpID: RPID,
        allowCredentials: allowCredentials,
    })
    challenges[username] = options.challenge;
    return options
};

async function loginFinish (username, credential) {
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
    return verified;
};



export {registerStart, registerFinish, loginStart, loginFinish}