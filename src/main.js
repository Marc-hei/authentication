import { registerStart, registerFinish, loginStart, loginFinish } from './methods/server.js';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';

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

function handleLoginSuccess(e) {
  authPage.style.display = "none";
  homePage.style.display = "block";
}


async function loginWithPassword (event) {
  event.preventDefault();
  const username = document.getElementById('login-password-username').value.trim();
  const password = document.getElementById('login-password-password').value.trim();
  console.log("Login with Password done", username, password);
  handleLoginSuccess()
}

async function registerWithPassword(event) {
  event.preventDefault();
  const username = document.getElementById('register-password-username').value.trim();
  const password = document.getElementById('register-password-password').value.trim();
  console.log("Register with Password done", username, password);
  handleLoginSuccess()
}

async function loginWithPasskey (event) {
  event.preventDefault();
  const username = document.getElementById('login-passkey-username').value.trim();
  try {
    const options = await loginStart(username);
    const credential = await startAuthentication({ optionsJSON: options });
    const response = await loginFinish(username, credential);
    if (response === true) {
      handleLoginSuccess();
    } else {
      alert("Login failed");
      console.error("Login failed");
    }
  } catch (err) {
      alert("Login error");
    console.error("Login error:", err);
  }
}

async function registerWithPasskey(event) {
  event.preventDefault();
  const username = document.getElementById('register-passkey-username').value.trim();
  try {
    const options = await registerStart(username);
    const credential = await startRegistration({ optionsJSON: options });
    const response = await registerFinish(options.user.id, username, credential)
    if (response == true) {
      handleLoginSuccess();
      console.log("Registration successful");
    } else {
      alert("Registration failed")
      console.error("Registration failed");
    }
  } catch (err) {
    alert("Registration error")
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
