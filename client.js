// IMPORTS
import { registerStart, registerFinish, loginStart, loginFinish } from './server.js';

// DOM ELEMENTS
const registerKey = document.getElementById('register');
const loginKey = document.getElementById('login');





// FUNCTIONS
async function register(username) { 
  const options = registerStart(username);
  const credential = await navigator.credentials.get({publicKey: options});
  const JSONcredential = JSON.stringify(credential)
  const response = registerFinish(username, JSONcredential)
  if (response == true) {
    console.log("Registration successful");
    // TODO: change to logged in page
  } else {
    console.error("Registration failed");
  }
}


async function login(username) {
  const JSONoptions = loginStart(username);
  const options = JSON.parse(JSONoptions);
  const credential = await navigator.credentials.get({publicKey: options});
  const JSONcredential = JSON.stringify(credential)
  const response = loginFinish(username, JSONcredential);
  if (response == true) {
    console.log("Login successful");
    // TODO: change to logged in page
  } else {
    console.error("Login failed");
  }
}



// EVENT LISTENERS
registerKey.addEventListener('click', register)
loginKey.addEventListener('click', login)