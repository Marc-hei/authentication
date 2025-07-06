import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { passkeyRegisterStart, passkeyRegisterFinish, passkeyLoginStart, passkeyLoginFinish, addPasskeyStart, addPasskeyFinish } from './methods/passkey.js';
import { passwordRegister, passwordLogin, addPassword } from './methods/password.js';
import { add2FA, verify2FA } from './methods/2fa.js';
import { getSessionCookie, removeSessionCookie } from './methods/cookie.js';

// === DOME ELEMENTS ===
const loginBtn              = document.getElementById("btn-login");
const registerBtn           = document.getElementById("btn-register");
const passwordBtn           = document.getElementById("btn-password");
const passkeyBtn            = document.getElementById("btn-passkey");
const logoutBtn             = document.getElementById("logout-btn");
const authPage              = document.getElementById("auth-page");
const homePage              = document.getElementById("home-page");;
const actionIndicator       = document.getElementById("action-indicator");
const methodIndicator       = document.getElementById("method-indicator");
const formPanels            = document.querySelectorAll(".form-panel");
const loginPasswordForm     = document.getElementById("login-password-form");
const loginPasskeyForm      = document.getElementById("login-passkey-form");
const registerPasswordForm  = document.getElementById("register-password-form");
const registerPasskeyForm   = document.getElementById("register-passkey-form");
const qrCodeImage           = document.getElementById("qr-code");
const secretTextField       = document.getElementById("secret-text");
const qrOverlay             = document.getElementById("qr-overlay");
const usernameHeader        = document.getElementById("dashboard-username");
const enablePasswordBtn     = document.getElementById("enable-password-btn");
const passwordInputGroup    = document.getElementById("password-input-group");
const passwordEnabled       = document.getElementById("password-enabled-indicator")
const submitPasswordBtn     = document.getElementById("submit-password-btn");
const passkeyCountText      = document.getElementById("passkey-count");  
const addPasskeyBtn         = document.getElementById("add-passkey-btn");
const enable2faBtn          = document.getElementById("enable-2fa-btn");
const faEnabled             = document.getElementById("2fa-enabled-indicator");
const closeQrBtn            = document.getElementById("close-qr-code");
const form2FA               = document.getElementById("2FA-form");

// === STATE VARIABLES ===
let currentAction = "register";
let currentMethod = "passkey";
let user;

try {
  user = await getSessionCookie();
  handleLoginSuccess();
} catch (err) {}


// === FUNCTIONS ===
function slideAction(action) {
  currentAction = action;
  registerBtn.classList.toggle("active", action === "register");
  loginBtn.classList.toggle("active", action === "login");
  actionIndicator.classList.toggle("active", action === "login");
  updateVisibleFormPanel();
}

function slideMethod(method) {
  currentMethod = method;
  passkeyBtn.classList.toggle("active", method === "passkey");
  passwordBtn.classList.toggle("active", method === "password");
  methodIndicator.classList.toggle("active", method === "password");
  updateVisibleFormPanel();
}

function updateVisibleFormPanel() {
  formPanels.forEach(panel => {
    const panelAction = panel.getAttribute("data-action");     // login or register
    const panelMethod = panel.getAttribute("data-method");     // password or passkey
    if (panelAction === currentAction && panelMethod === currentMethod) {
      panel.classList.add("active");
    } else {
      panel.classList.remove("active");
    }
  });
}

async function handleLogout() {
  try {
    await removeSessionCookie();
    authPage.style.display = "block";
    homePage.style.display = "none";
  } catch (err) {
    console.error(err);
  }
}


function handleLoginSuccess() {
  authPage.style.display = "none";
  homePage.style.display = "block";
  usernameHeader.textContent = `Welcome, ${user.userName}`;

  // === PASSWORD METHOD ===
  if (user.availableMethods.password) {
    enablePasswordBtn.style.display = "none";
    passwordInputGroup.style.display = "none";
    passwordEnabled.style.display = "inline";
  } else {
    enablePasswordBtn.style.display = "inline-block";
    passwordInputGroup.style.display = "none";
    passwordEnabled.style.display = "none";
  }

  // === PASSKEY METHOD ===
  const passkeyCount = user.passkeys?.length || 0;
  passkeyCountText.textContent = `${passkeyCount > 0 ? '✅ ' : ''}${passkeyCount} Passkey${passkeyCount == 1 ? '': 's'}`;

  // === 2FA METHOD ===
  if (user.availableMethods["2FA"]) {
    enable2faBtn.style.display = "none";
    faEnabled.style.display = "inline";
  } else {
    enable2faBtn.style.display = "inline-block";
    faEnabled.style.display = "none";
  }
}

async function loginWithPassword (event) {
  event.preventDefault();
  const username = document.getElementById('login-password-username').value.trim();
  const password = document.getElementById('login-password-password').value.trim();
  try {
    user = await passwordLogin(username, password);
    if (user.requires2FA) {
      loginPasswordForm.classList.remove("active");
      form2FA.classList.add("active");
      return;
    }
    handleLoginSuccess();
  } catch (err) {
    alert("Login Failed");
    console.error("Login error:", err);
  }
}

async function registerWithPassword(event) {
  event.preventDefault();
  const username = document.getElementById('register-password-username').value.trim();
  const password = document.getElementById('register-password-password').value.trim();
  const confirmPassword = document.getElementById('register-password-confirmPassword').value.trim();
  try {
    user = await passwordRegister(username, password, confirmPassword);
    handleLoginSuccess();
  } catch (err) {
    alert("Register Failed");
    console.error("Login error:", err);
  }
}

async function enablePassword() {
  const userId = user.userId;
  if (!userId) {
    alert("userid not found");
    return;
  }
  const password = document.getElementById('add-password-password').value.trim();
  const confirmPassword = document.getElementById('add-password-confirmPassword').value.trim();
  try {
    user = await addPassword(userId, password, confirmPassword);
    handleLoginSuccess();
  } catch (err) {
    alert("Login Failed");
    console.error("Login error:", err);
  }
}

async function loginWithPasskey (event) {
  event.preventDefault();
  const username = document.getElementById('login-passkey-username').value.trim();
  try {
    const options = await passkeyLoginStart(username);
    const credential = await startAuthentication({ optionsJSON: options });
    user = await passkeyLoginFinish(username, credential);
    handleLoginSuccess();
  } catch (err) {
    alert("Login Failed");
    console.error("Login error:", err);
  }
}

async function registerWithPasskey(event) {
  event.preventDefault();
  const username = document.getElementById('register-passkey-username').value.trim();
  try {
    const options = await passkeyRegisterStart(username);
    const credential = await startRegistration({ optionsJSON: options });
    user = await passkeyRegisterFinish(options.user.id, username, credential)
    handleLoginSuccess();
  } catch (err) {
    alert("Registration Failed")
    console.error("Registration error:", err);
  }  
}

async function addPasskey() {
  const userId = user.userId;
  if (!userId) {
    alert("userid not found");
    return;
  }
  try {
    const options = await addPasskeyStart(userId);
    const credential = await startRegistration({ optionsJSON: options });
    user = await addPasskeyFinish(userId, credential)
    handleLoginSuccess(); // reload page
  } catch (err) {
    alert("Registration Failed")
    console.error("Registration error:", err);
  }  
}

async function enable2FA() {
  const userId = user.userId;
  if (!userId) {
    alert("userid not found");
    return;
  }
  try {
    user = await add2FA(userId);
    qrCodeImage.src = user.qrCodeDataUrl;
    secretTextField.textContent = user.secretText;
    qrOverlay.style.display = "block";
  } catch (err) {
    alert("Registration Failed")
    console.error("Registration error:", err);
  }
  
}

async function loginWith2FA(event) {
  event.preventDefault()
  const code = document.getElementById("2FA-code").value.trim();
  const userId = user.userId;
  if (!userId || !code) return;

  try {
    user = await verify2FA(userId, code);
    handleLoginSuccess();
  } catch (err) {
    alert("Invalid 2FA code");
    console.error("2FA error:", err);
  }
}


// === EVENT LISTENERS ===
loginBtn.addEventListener("click", () => slideAction("login"));
registerBtn.addEventListener("click", () => slideAction("register"));
passwordBtn.addEventListener("click", () => slideMethod("password"));
passkeyBtn.addEventListener("click", () => slideMethod("passkey"));
logoutBtn.addEventListener("click", handleLogout);
loginPasswordForm.addEventListener("submit", loginWithPassword)
loginPasskeyForm.addEventListener("submit", loginWithPasskey)
registerPasswordForm.addEventListener("submit", registerWithPassword)
registerPasskeyForm.addEventListener("submit", registerWithPasskey)
enablePasswordBtn.addEventListener("click", () => {
  enablePasswordBtn.style.display = "none";
  passwordInputGroup.style.display = "block";
});
submitPasswordBtn.addEventListener("click", enablePassword);
enable2faBtn.addEventListener("click", enable2FA);
addPasskeyBtn.addEventListener("click", addPasskey);
closeQrBtn.addEventListener("click", () => {
  qrOverlay.style.display = "none";
  handleLoginSuccess(); // reload page
});
form2FA.addEventListener("submit", loginWith2FA)