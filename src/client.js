// IMPORTS
import { registerStart, registerFinish, loginStart, loginFinish } from './server.js';

// DOM ELEMENTS
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const loginPage = document.getElementById('login-page');
const homePage = document.getElementById('home-page');


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
registerForm.addEventListener('submit', register);
loginForm.addEventListener('submit', login);