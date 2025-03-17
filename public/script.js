// DOM objects

const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

const main = document.querySelector("main");
const form = document.querySelector(".form");
const secretInput = document.getElementById("secret-input");
const daysInput = document.getElementById("days-input");

// VARIABLES
let copyText = '';

// FUNCTIONS

function toggleNav() {
  nav.classList.toggle("nav--visible");
}

// Create copy to clipboard button
function copyLink() {
  // Copy to clipboard
  window.navigator.clipboard.writeText(copyText);
  // Confirm it's copied
  alert("The link has been copied.");
}

// This function manipulates the DOM when a secret is submitted

function showSecretLink( link, days ) {
  // Remove the form so that another secret can't be submitted
  main.removeChild(form);
  
  // Create a container div
  const div = document.createElement("div");
  div.classList.add("container");
  div.classList.add("secret-container");
  
  // Show the link to retrieve the secret and update the link variable
  const linkEl = document.createElement("h2");
  linkEl.textContent = `https://secrets-safe.glitch.me/getSecret/?id=${link}`;
  copyText = linkEl.textContent;
  
  div.appendChild(linkEl);
  
  // Provide a copy to clipboard button
  const copyButton = document.createElement("button");
  copyButton.classList.add("btn");
  copyButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
  copyButton.addEventListener("click", copyLink);
  
  div.appendChild(copyButton);
  
  // Show a message advising that the link will expire
  const p = document.createElement("p");
  p.innerText = (days === "1" ? "This link will expire in 24 hours" : `This link will expire in ${days} days`);
  
  div.appendChild(p);
  
  // Add this div to the main element of the page
  main.appendChild(div);
  
  // Provide a button for the home page to create another secret
  const homeButton = document.createElement("button");
  homeButton.classList.add("btn");
  homeButton.innerHTML = `<span><a href="https://secrets-safe.glitch.me/">CREATE ANOTHER SECRET</a></span>`;
  
  main.appendChild(homeButton);
}

// Used to do a fetch request with query parameters but this wouldn't allow symbols, like the hash key.
// function postSecret( secret, days = 1 ) {
//   fetch(`/sendSecret/${secret}/${days}/`)
//     .then(res => res.json()) // parse the JSON from the server
//     .then(obj => {
//     const id = obj._id;
//     // Call the showSecretLink function with the database ID, used to retrieve secret
//     showSecretLink(id, days);
//   })
// }

// This is the function to create the link for the secret
function postSecret( secret, days = 1 ) {
  const data = {
    "secret": secret,
    "expiry": days
  };
  
  fetch("/sendSecret/", {
    method: "POST",
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify(data)
  })
    .then(res => res.json()) // parse the JSON from the server
    .then(obj => {
    const id = obj._id
    // Call the showSecretLink function with the database ID, used to retrieve secret
    showSecretLink(id, days);
  });
}

// EVENT LISTENERS

navToggle.addEventListener("click", toggleNav);

// Add event listener to form
form.addEventListener("submit", e => {
  // Stop the form submission from refreshing the page
  e.preventDefault();

  // Get value of secret
  // This is a required field so will never be empty
  const secretValue = secretInput.value;
  
  
  // Get value of expiry days input
  let expiryValue = daysInput.value;
  // If an expiry value isn't given, default to 1.
  if (expiryValue === "") {
    expiryValue = "1";
  }
  
  // Post the secret to the server
  // This function then calls the function that manipulates the DOM
  postSecret(secretValue, expiryValue);

  // Reset form
  form.reset();
});
