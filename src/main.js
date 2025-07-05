import { passkeyRegisterStart, passkeyRegisterFinish, passkeyLoginStart, passkeyLoginFinish, addPasskeyStart, addPasskeyFinish } from './methods/passkeys.js';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { passwordRegister, passwordLogin, addPassword } from './methods/passwords.js'
import { add2FA } from './methods/2fa.js'

// === DOME ELEMENTS ===
const loginBtn            = document.getElementById("btn-login");
const registerBtn         = document.getElementById("btn-register");
const passwordBtn         = document.getElementById("btn-password");
const passkeyBtn          = document.getElementById("btn-passkey");
const logoutBtn           = document.getElementById("logout-btn");
const authPage            = document.getElementById("auth-page");
const homePage            = document.getElementById("home-page");;
const actionIndicator     = document.getElementById("action-indicator");
const methodIndicator     = document.getElementById("method-indicator");
const formPanels          = document.querySelectorAll(".form-panel");
const loginPasswordForm   = document.getElementById("login-password-form");
const loginPasskeyForm    = document.getElementById("login-passkey-form");
const registerPasswordForm = document.getElementById("register-password-form");
const registerPasskeyForm  = document.getElementById("register-passkey-form");



// === STATE VARIABLES ===
let currentAction = "register";
let currentMethod = "passkey";
let user;


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

function handleLogout() {
  authPage.style.display = "block";
  homePage.style.display = "none";
}

function handleLoginSuccess() {
  authPage.style.display = "none";
  homePage.style.display = "block";
  console.log(user);

  // Set dashboard title
  const usernameHeader = document.getElementById("dashboard-username");
  usernameHeader.textContent = `Welcome, ${user.userName}`;

  // === PASSWORD METHOD ===
  const passwordControls = document.getElementById("password-controls");
  if (user.availableMethods.password) {
    passwordControls.innerHTML = `<span class="enabled">✅ Enabled</span>`;
  } else {
    passwordControls.innerHTML = `<button id="enable-password-btn">Enable</button>`;
  }

  // === PASSKEY METHOD ===
  const passkeyCount = user.passkeys?.length || 0;
  const passkeyControls = document.getElementById("passkey-controls");
  passkeyControls.innerHTML = `
    <span id="passkey-status">
      ${user.availableMethods.passkey ? '✅ Enabled' : '➕ Enable'} (${passkeyCount} key${passkeyCount !== 1 ? 's' : ''})
    </span>
    <button id="add-passkey-btn">Add Passkey</button>
  `;

  // === 2FA METHOD ===
  const faControls = document.getElementById("2fa-controls");
  if (user.availableMethods["2FA"]) {
    faControls.innerHTML = `<span class="enabled">✅ Enabled</span>`;
  } else {
    faControls.innerHTML = `<button id="enable-2fa-btn">Enable</button>`;
  }

  // Rebind any newly added buttons
  bindMethodEnableButtons();
}


function bindMethodEnableButtons() {
  // Enable Password
  const enablePasswordBtn = document.getElementById("enable-password-btn");
  if (enablePasswordBtn) {
    enablePasswordBtn.addEventListener("click", () => {
      const passwordControls = document.getElementById("password-controls");
      passwordControls.innerHTML = `
        <input type="password" id="add-password-password" placeholder="New Password">
        <input type="password" id="add-password-confirmPassword" placeholder="Confirm Password">
        <button id="submit-password-btn">Submit</button>
      `;
      document.getElementById("submit-password-btn").addEventListener("click", enablePassword);
    });
  }
// Add Passkey
  const addPasskeyBtn = document.getElementById("add-passkey-btn");
  if (addPasskeyBtn) {
    addPasskeyBtn.addEventListener("click", addPasskey);
  }


  // Enable 2FA
  const enable2faBtn = document.getElementById("enable-2fa-btn");
  if (enable2faBtn) {
    enable2faBtn.addEventListener("click", add2FA);
  }
  
}


async function loginWithPassword (event) {
  event.preventDefault();
  const username = document.getElementById('login-password-username').value.trim();
  const password = document.getElementById('login-password-password').value.trim();
  try {
    user = await passwordLogin(username, password);
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
    handleLoginSuccess();
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
  } catch (err) {
    alert("Registration Failed")
    console.error("Registration error:", err);
  }
  
}

// === EVENT LISTENERS ===
loginBtn.addEventListener("click", () => slideAction("login"));
registerBtn.addEventListener("click", () => slideAction("register"));
passwordBtn.addEventListener("click", () => slideMethod("password"));
passkeyBtn.addEventListener("click", () => slideMethod("passkey"));
logoutBtn.addEventListener("click", handleLogout);

loginPasswordForm.addEventListener("submit", loginWithPassword)
loginPasskeyForm .addEventListener("submit", loginWithPasskey)
registerPasswordForm.addEventListener("submit", registerWithPassword)
registerPasskeyForm.addEventListener("submit", registerWithPasskey)
