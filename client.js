// IMPORTS
import { registerStart, registerFinish, loginStart, loginFinish } from './server.js';

// DOM ELEMENTS
const registerKey = document.getElementById('register');
const loginKey = document.getElementById('login');


// FUNCTIONS
async function register(username) {
  username = "hello"
  const options = registerStart(username);
  const credential = await navigator.credentials.create({publicKey: options});
  const response = await registerFinish(username, credential)
  console.log(response)
  if (response == true) {
    console.log("Registration successful");
    // TODO: change to logged in page
  } else {
    console.error("Registration failed");
  }
}


async function login(username) {
  const options = loginStart(username);
  console.dir(options)
  const credential = await navigator.credentials.get({publicKey: options});
  console.dir(credential)
  const response = await loginFinish(username, credential);
  console.log(response)
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