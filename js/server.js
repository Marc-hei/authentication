import {env} from './env.js';
const {RPID, RPNAME} = env;


// const SimpleWebAuthnServer = require('@simplewebauthn/server');
let users = {};
let publicKeys = {};
let challenges = {};
const expectedOrigin = ['http://localhost:3000'];

// TODO: check database for username
function registerStart (username) {
    let challenge = createUint8Array();
    console.log("uuid: ", challenge.string);
    console.log("challenge: ", challenge.array);

    let userID = createUint8Array();
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
    const attestation = credential.response;
    publicKeys[username] = credential.rawId;
    console.log("publickeys[username]", publicKeys[username]);
    console.log(attestation.getPublicKey());
    console.log(attestation.getPublicKeyAlgorithm());
    const algoNum = attestation.getPublicKeyAlgorithm();
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

    // parse the string as an object
    const clientDataObj = JSON.parse(decodedClientData);

    console.log("challenges[username]", challenges[username])
    console.log("clientdataob.challenge", clientDataObj.challenge)
    console.assert(clientDataObj.challenge === challenges[username], "failed")
//    crypto.subtle.verify(
//        algoName,
//        attestation.getPublicKey(),
//        attestation.attestationObject.attStmt.sig;


    //console.dir(attestation.attestationObject);
    //console.dir(attestation.clientDataJSON);
    //console.dir(attestation);
    //console.log(attestation.getTransports());
    //console.log(attestation.getAuthenticatorData());
    // try {
    //     verification = await SimpleWebAuthnServer.verifyRegistrationResponse({
    //         response: credential.response,
    //         expectedChallenge: challenges[username],
    //         expectedOrigin:expectedOrigin
    //     });
    // } catch (error) {
    //     console.error(error);
    //     return;
    // }
    // const {verified, registrationInfo} = verification;
    // if (verified) {
    //     users[username] = registrationInfo;
    //     return true;
    //     // TODO: save registration info in database
    // }
    return true;
};

function loginStart(username) {
    //let username = req.body.username;
    // if (!users[username]) {
    //     return false;
    // }
    let challenge = createUint8Array();
    challenges[username] = challenge;
    console.log("second publicKeys[username]", publicKeys[username]);
    return {
        challenge: challenge,
        rpId: RPID,
        allowCredentials: [
        {
         type: "public-key",
         id: publicKeys[username],
        },
        ],
        userVerification: 'required',
    };
};

async function loginFinish (username, credential) {
    if (!users[username]) {
       return false;
    }
    let verification;
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
    // return verified;
};

function createUint8Array() {
    const string = crypto.randomUUID();
    const array = Uint8Array.from(string, c => c.charCodeAt(0));
    console.log(string)
    return {string, array};
}

//function createUint8Array() {
//    return crypto.getRandomValues(new Uint8Array(16));
//}
    

function transformUint8Array(arr) {
   return btoa(arr);
}

export {registerStart, registerFinish, loginStart, loginFinish}