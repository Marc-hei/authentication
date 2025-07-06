import { createRandomBase64URLString } from '../helpers/base64url.js'
import { createSession, getSession, getUser, removeSession } from './database.js';

async function setSessionCookie(userId, daysValid = 7) {
  const sessionId = createRandomBase64URLString();
  const now = new Date();
  const createdAt = now.toISOString();
  const expirationDate = new Date(now.getTime() + daysValid * 24 * 60 * 60 * 1000);
  const expiresAt = expirationDate.toISOString();
  const expires = `expires=${expirationDate.toUTCString()}`;
  const options = {
    userId: userId,
    createdAt: createdAt,
    expiresAt: expiresAt
  }
  await createSession(sessionId, options)
  document.cookie = `sessionId=${sessionId}; ${expires}; path=/; SameSite=Strict; Secure`;
}

function getCookieValue(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
}

async function getSessionCookie() {
  const sessionId = getCookieValue('sessionId');
  if (!sessionId) {
    throw new Error('No session cookie found.');
  }

  const session = await getSession(sessionId);
  if (!session) {
    throw new Error('Session not found.');
  }

  const now = new Date();
  if (new Date(session.expiresAt) < now) {
    await removeSession(sessionId);
    document.cookie = `sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure`;
    throw new Error('Session expired.');
  }

  const user = await getUser(session.userId);
  if (!user) {
    throw new Error('User not found for this session.');
  }

  return user;
}

async function removeSessionCookie() {
  const sessionId = getCookieValue('sessionId');
  if (sessionId) {
    await removeSession(sessionId);
  }
  document.cookie = `sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure`;
}


export { setSessionCookie, getSessionCookie, removeSessionCookie }