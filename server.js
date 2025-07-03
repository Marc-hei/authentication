import {env} from '/env.js';
const {RPID, RPNAME} = env;

require('dotenv').config();
const SimpleWebAuthnServer = require('@simplewebauthn/server');
let users = {};
let challenges = {};
const rpId = 'localhost';
const expectedOrigin = ['http://localhost:3000'];

// TODO: check database for username
function registerStart (username) {
    let challenge = getNewChallenge();
    challenges[username] = challenge;

    const pubKey = {
        challenge: challenge,
        rp: {id: RPID, name: RPNAME},
        user: {id: createUserId(), name: username},
        pubKeyCredParams: [

            {type: 'public-key', alg: -7},
            {type: 'public-key', alg: -8},
            {type: 'public-key', alg: -257},
        ],
        authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
            requireResidentKey: false,
        }
    };
    return JSON.stringify(pubKey);
};
async function registerFinish (username, credential) {
    // Verify the attestation response
    // id, rawid, response, type, authenticatorAttachment
    credential = JSON.parse(credential);
    let verification;
    try {
        verification = await SimpleWebAuthnServer.verifyRegistrationResponse({
            response: credential.response,
            expectedChallenge: challenges[username],
            expectedOrigin:expectedOrigin
        });
    } catch (error) {
        console.error(error);
        return;
    }
    const {verified, registrationInfo} = verification;
    if (verified) {
        users[username] = registrationInfo;
        return true;
        // TODO: save registration info in database
    }
    return false;
};

function loginStart(username) {
    //let username = req.body.username;
    if (!users[username]) {
        return false;
    }
    let challenge = getNewChallenge();
    challenges[username] = challenge;
    return JSON.stringify({
        challenge,
        RPID,
        allowCredentials: [{
            type: 'public-key',
            id: users[username].credentialID,
        }],
        userVerification: 'required',
    });
};

async function loginFinish (username, credential) {
    if (!users[username]) {
       return false;
    }
    let verification;
    try {
        const user = users[username];
        verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
            expectedChallenge: challenges[username],
            response: req.body.data,
            authenticator: user,
            expectedRPID: RPID,
            expectedOrigin,
            requireUserVerification: false
        });
    } catch (error) {
        console.error(error);
        return {error: error.message};
    }
    const {verified} = verification;
    return verified;
};

function getNewChallenge() {
    return new Uint8Array(crypto.randomBytes(16));
}

function createUserId() {
    return crypto.randomUUID();
}