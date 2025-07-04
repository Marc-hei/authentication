import {env} from './env.js';
import { createUser, extendUser, getUser, checkIfUserExists, getUserId } from './database.js';
import {decode } from './cbor.js'
import {coseToJwk } from './cose-to-jwk.js'
const {RPID, RPNAME, EXPECTEDORIGIN} = env;


let users = {};
let userIds = {};
let challenges = {};

async function registerStart (username) {
    let challenge = createUint8Array();
    const userExists = await checkIfUserExists(username);
    if (userExists) {
        throw new Error("Username already exists");
    }
    let userID = createUint8Array();
    userIds[username] = userID.string;
    challenges[username] = btoa(challenge.string);
    return {
        challenge: challenge.array,
        rp: {id: RPID, name: RPNAME},
        user: {id: userID.array, name: username, displayName: username},
        pubKeyCredParams: [
            {type: 'public-key', alg: -7},
            {type: 'public-key', alg: -8},
            {type: 'public-key', alg: -257},
        ],
        userVerification: 'required'
    };
};
async function registerFinish (username, credential) {
    // Verify the attestation response
    // id, rawid, response, type, authenticatorAttachment
    const publicKeyBytes = credential.response.getPublicKey();
    const algoNum = credential.response.getPublicKeyAlgorithm();
    let algoName;
    if (algoNum === -7) {
        algoName = {name: 'ECDSA', hash: {name: 'SHA-256'}};
    } else if (algoNum === -8) {
        algoName = {name: 'Ed25519'};
    } else if (algoNum === -257) {
        algoName = {name: 'RSASSA-PKCS1-v1_5'}
    } else {
        return false;
    }
    // decode the clientDataJSON into a utf-8 string
    const utf8Decoder = new TextDecoder('utf-8');
    const decodedClientData = utf8Decoder.decode(
        credential.response.clientDataJSON)
    const clientDataObj = JSON.parse(decodedClientData);
    if (clientDataObj.challenge !== challenges[username]) {
        return;
    }
    if (clientDataObj.origin !== EXPECTEDORIGIN) {
        return;
    }
    if (clientDataObj.type !== 'webauthn.create') {
        return;
    }
    console.assert(clientDataObj.challenge === challenges[username], "failed")

    await createUser({
        userId: userIds[username],
        username: username,
        publicKey: arrayBufferToString(publicKeyBytes),
        keyAlgoNum: algoNum, 
        keyAlgoName: algoName,
        authId: arrayBufferToString(credential.rawId),
    })
    return true;
};

async function loginStart(username) {
    //let username = req.body.username;
    // if (!users[username]) {
    //     return false;
    // }
    const userId = await getUserId(username);
    console.log(userId);
    if (!userId) {
        return false;
    }
    let challenge = createUint8Array();
    challenges[username] = challenge;
    const user = await getUser(userId.userId);
    console.log(user);
    return {
        challenge: challenge.array,
        rpId: RPID,
        allowCredentials: [
        {
            type: "public-key",
            id: StringToUint8Array(user.authId),
        },
        ],
        userVerification: 'required',
    };
};

async function loginFinish (username, credential) {
    return true;
    const userId = await getUserId(username);
    if (!userId) {
        return false;
    }

    const user = await getUser(userId.userId);

    // 3. Map to JWK
    const publicKey = StringToUint8Array(user.publicKey);
    console.log(publicKey);
    const jwk = coseToJwk(user.publicKey);

    const verified = crypto.subtle.verify(
        user.keyAlgoName,
        jwk,
        credential.signature,
        credential.clientDataJSON || credential.authenticatorData
    )
    console.log("verified: ", verified)
    // try {
    //     const user = users[username];
    //     verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
    //         expectedChallenge: challenges[username],
    //         response: req.body.data,
    //         authenticator: user,
    //         expectedRPID: RPID,
    //         expectedOrigin,
    //         requireUserVerification: false
    //     });
    // } catch (error) {
    //     console.error(error);
    //     return {error: error.message};
    // }
    // const {verified} = verification;
    return verified;
};

function createUint8Array() {
    const string = crypto.randomUUID();
    const array = Uint8Array.from(string, c => c.charCodeAt(0));
    // console.log(string)
    return {string, array};
}

//function createUint8Array() {
//    return crypto.getRandomValues(new Uint8Array(16));
//}
    

function transformUint8Array(arr) {
   return btoa(arr);
}

function arrayBufferToString(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let b of bytes) {
    binary += String.fromCharCode(b);
  }
  return binary;
}


function StringToUint8Array(binary) {
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}


export {registerStart, registerFinish, loginStart, loginFinish}