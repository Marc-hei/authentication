// IMPORTS
import { registerStart, registerFinish, loginStart, loginFinish } from './server.js';

// DOM ELEMENTS
// const registerForm = document.getElementById('register-form');
// const loginForm = document.getElementById('login-form');
// const loginPage = document.getElementById('login-page');
// const homePage = document.getElementById('home-page');


// FUNCTIONS
async function register(event) {
  event.preventDefault();
  const username = document.getElementById('username1').value.trim();
  if (!username) return alert('Please enter a username');

  try {
    const options = await registerStart(username);
    const credential = await navigator.credentials.create({publicKey: options});
    const response = await registerFinish(username, credential)
    if (response == true) {
      console.log("Registration successful");
      loginPage.style.display = 'none';
      homePage.style.display = 'block';
    } else {
      console.error("Registration failed");
    }
  } catch (err) {
    console.error("Registration error:", err);
  }
}


async function login(event) {
  event.preventDefault();
  const username = document.getElementById('username2').value.trim();
  if (!username) return alert('Please enter a username');

  try {
    const options = await loginStart(username);
    const credential = await navigator.credentials.get({ publicKey: options });
    const response = await loginFinish(username, credential);

    if (response === true) {
      console.log("Login successful");
      loginPage.style.display = 'none';
      homePage.style.display = 'block';
    } else {
      console.error("Login failed");
    }
  } catch (err) {
    console.error("Login error:", err);
  }
}



// EVENT LISTENERS
// registerForm.addEventListener('submit', register);
// loginForm.addEventListener('submit', login);

// === ELEMENT REFERENCES ===
const loginBtn            = document.getElementById("btn-login");
const registerBtn         = document.getElementById("btn-register");
const passwordBtn         = document.getElementById("btn-password");
const passkeyBtn          = document.getElementById("btn-passkey");
const logoutBtn           = document.getElementById("logout-btn");
const authPage            = document.getElementById("auth-page");
const homePage            = document.getElementById("home-page");
const forms               = document.querySelectorAll("form");
const actionIndicator     = document.getElementById("action-indicator");
const methodIndicator     = document.getElementById("method-indicator");
const formPanels          = document.querySelectorAll(".form-panel");


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
  e.preventDefault();
  authPage.style.display = "none";
  homePage.style.display = "block";
}


// === EVENT LISTENERS ===
loginBtn.addEventListener("click", () => slideAction("login"));
registerBtn.addEventListener("click", () => slideAction("register"));
passwordBtn.addEventListener("click", () => slideMethod("password"));
passkeyBtn.addEventListener("click", () => slideMethod("passkey"));
logoutBtn.addEventListener("click", handleLogout);

forms.forEach(form => {
  form.addEventListener("submit", handleLoginSuccess);
});