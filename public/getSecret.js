// DOM objects
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

const main = document.querySelector(".main");
const container = document.querySelector(".secret-container");
const retrieveSecretElements = document.querySelector(".retrieve-secret-elements");
const retrieveSecretBtn = document.querySelector(".retrieve-secret-btn");
const warningP = document.querySelector(".warning-p");

// VARIABLES

let secretText = '';

// Get the parameters passed into the URL
const params = new URLSearchParams(location.search);
// Get the ID of the secret from the parameters
const secretID = params.get("id");

// FUNCTIONS

// Create copy to clipboard button
function copySecret() {
  // Copy to clipboard
  navigator.clipboard.writeText(secretText);
  
  // Confirm it's copied
  alert("The secret has been copied.");
}

// This function manipulates the DOM when a secret is requested

function showSecret(secret) {
  // Remove the elements that are no longer needed
  main.removeChild(retrieveSecretElements);
  container.removeChild(retrieveSecretBtn);
  
  // Text to accompany the secret
  const newP = document.createElement("p");
  newP.textContent = "Here's your secret...";
  
  container.appendChild(newP);
  
  // Show the secret on the page
  const secretEl = document.createElement("h2");
  secretEl.textContent = secret;
  
  container.appendChild(secretEl);
  
  // Provide a copy to clipboard button
  secretText = secret;
  const copyButton = document.createElement("button");
  copyButton.classList.add("btn");
  copyButton.innerHTML = `<span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg></span>`;
  copyButton.addEventListener("click", copySecret);
  
  container.appendChild(copyButton);
  
  // Provide a button for the home page to create your own secret link
  const homeButton = document.createElement("button");
  homeButton.classList.add("btn");
  homeButton.innerHTML = `<span><a href="https://secrets-safe.glitch.me/">CREATE A SECRET</a></span>`;
  
  main.appendChild(homeButton);
}

function noSecret() {
  // Remove the elements that are no longer needed
  main.removeChild(retrieveSecretElements);
  main.removeChild(warningP);
  container.removeChild(retrieveSecretBtn);
  
  // Advise there is no secret
  const secretEl = document.createElement("h2");
  secretEl.textContent = "This secret has already been retrieved.";
  
  container.appendChild(secretEl);
  
  // Provide a button for the home page to create your own secret link
  const homeButton = document.createElement("button");
  homeButton.classList.add("btn");
  homeButton.innerHTML = `<span><a href="https://secrets-safe.glitch.me/">CREATE A SECRET</a></span>`;
  
  container.appendChild(homeButton);
}
          
// This is the function that requests the secrets from the server
function getSecret( id ) {
  fetch(`/retrieveSecret/${id}`)
    .then(res => res.json()) // parse the JSON from the server
    .then(obj => {
      const secret = obj.secret;
      console.log(secret);
      // Advise if the secret exists, else show it
    if (secret) {
      showSecret(secret);
    } else {
      noSecret();
    }
    });
}

// EVENT LISTENERS
retrieveSecretBtn.addEventListener("click", () => {
  getSecret(secretID);
});