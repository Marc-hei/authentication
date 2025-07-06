import QRCode from 'qrcode'
import { createUser, storePasskey, extendUser, getUser, getPasskey, checkIfUserExists, getUserId } from './database.js';
import { createRandomBase32String } from '../helpers/base32.js'
import { setSessionCookie } from './cookie.js';

async function totp(key, secs = 30, digits = 6){
  return hotp(unbase32(key), pack64bu(Date.now() / 1000 / secs), digits);
}
async function hotp(key, counter, digits){
  let k = await crypto.subtle.importKey('raw', key, {name: 'HMAC', hash: 'SHA-1'}, false, ['sign']);
  return hotp_truncate(await crypto.subtle.sign('HMAC', k, counter), digits);
}
function hotp_truncate(buf, digits){
  let a = new Uint8Array(buf), i = a[19] & 0xf;
  return fmt(10, digits, ((a[i]&0x7f)<<24 | a[i+1]<<16 | a[i+2]<<8 | a[i+3]) % 10**digits);
}
function fmt(base, width, num){
  return num.toString(base).padStart(width, '0')
}
function unbase32(s){
  let t = (s.toLowerCase().match(/\S/g)||[]).map(c => {
    let i = 'abcdefghijklmnopqrstuvwxyz234567'.indexOf(c);
    if(i < 0) throw Error(`bad char '${c}' in key`);
    return fmt(2, 5, i);
  }).join('');
  if(t.length < 8) throw Error('key too short');
  return new Uint8Array(t.match(/.{8}/g).map(d => parseInt(d, 2)));
}
function pack64bu(v){
  let b = new ArrayBuffer(8), d = new DataView(b);
  d.setUint32(0, v / 2**32);
  d.setUint32(4, v);
  return b;
}

async function add2FA(userId) {
  const user = await getUser(userId);
  if (user.availableMethods["2FA"]) {
      throw new Error("User already has 2FA enabled");
  }
  const base32Secret = createRandomBase32String()
  const issuer = "gm-authentication";
  const label = `${issuer}:${user.userName}`;
  const otpAuthUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${base32Secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
  const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);
  await extendUser(userId, { 
    updatedAt: new Date().toISOString(),
    "availableMethods": {...user.availableMethods, "2FA": true },
    "2FA": base32Secret
  })
  return {
    ...user,
    updatedAt: new Date().toISOString(),
    availableMethods: {...user.availableMethods, "2FA": true },
    "2FA": base32Secret,
    secretText: base32Secret,
    qrCodeDataUrl: qrCodeDataUrl
  }
}

async function verify2FA(userId, code) {
  const user = await getUser(userId);
  if (!user.availableMethods["2FA"]) {
    throw new Error("User does not have 2FA enabled");
  }
  const expectedCode = await totp(user["2FA"]); // generate current TOTP from secret
  if (code === expectedCode) {
    await setSessionCookie(userId);
    return user;
  } else {
    throw new Error("Invalid 2FA code");
  }
}

export { add2FA, verify2FA }

