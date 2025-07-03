import {env} from '/env.js';
const {RPID, RPNAME} = env;


// const SimpleWebAuthnServer = require('@simplewebauthn/server');
let users = {};
let challenges = {};
const expectedOrigin = ['http://localhost:3000'];

// TODO: check database for username
function registerStart (username) {
    let challenge = createUint8Array();
    let userID = createUint8Array();
    challenges[username] = challenge;
    return {
        challenge: challenge,
        rp: {id: RPID, name: RPNAME},
        user: {id: userID, name: username, displayName: username},
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
    let verification;
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
    if (!users[username]) {
        return false;
    }
    let challenge = getNewChallenge();
    challenges[username] = challenge;
    return {
        challenge,
        RPID,
        allowCredentials: [{
            type: 'public-key',
            id: users[username].credentialID,
        }],
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
  return crypto.getRandomValues(new Uint8Array(16));
}

function transformUint8Array(arr) {
   return btoa(arr);
}

export {registerStart, registerFinish, loginStart, loginFinish}