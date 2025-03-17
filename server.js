// DEPENDENCIES
const express = require("express");
const app = express();

const ncrypt = require('ncrypt-js');
const _secretKey = process.env.ENCRYPTION_SECRET;
const ncryptObject = new ncrypt(_secretKey);

const mongoose = require("mongoose");
const { Schema } = mongoose;
 const handleError = (err) => {
  console.log(err);
}
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', handleError);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: "false"}));
app.use(bodyParser.json());

var cors = require("cors");
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// Make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// Use built in JSON middleware
app.use(express.json());

// https://expressjs.com/en/starter/basic-routing.html
// Serve index.html page by default
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Serve retrieveSecret.html page when retrieving a secret
app.get("/getSecret/", (req, res) => {
  res.sendFile(__dirname + "/views/getSecret.html");
})

// Serve contact.html
app.get("/contact/", (req, res) => {
  res.sendFile(__dirname + "/views/contact.html");
})

// Listen for requests
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

// MongoDB setup

const secretSchema = new Schema({
  secret: { type: String, required: true },
  createdAt: { type: Date, required: true },
  expireAt: { type: Date, required: true},
  expireAfterSeconds: { type: Number, required: true }
});

// The Model is called "Secret", which uses the "secretSchema", and they're saved in the "secret" collection
// They use the secrets collection as that's the lower case version of the model. if the collection
// has to be different, enter a third parameter.
const Secret = mongoose.model("Secret", secretSchema);

// FUNCTIONS

// Function to save secret object
const saveSecret = (obj) => {
  obj.save(function (err, data) {
    if (err) {
      return console.log(err);
    } else {
      console.log("Successfully created secret.");
    }
  });
  return obj.id;
}

// Function to delete secret object
const deleteSecret = (id) => {
  Secret.findByIdAndRemove(id, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully deleted secret.");
    }
  })
}

// Function to create expiry date
const oldGetExpiryDate = (today, numberOfDays) => {
  let expiryDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    (today.getDate() + parseInt(numberOfDays)),
    today.getHours(),
    today.getMinutes(),
    today.getSeconds());
  
  console.log(expiryDate);
  
  return expiryDate;
}

function getExpiryDate (today, numberOfDays) {
  let expiryDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    (today.getDate() + parseInt(numberOfDays)),
    today.getHours(),
    today.getMinutes(),
    today.getSeconds()
  );
  console.log(expiryDate);
  return expiryDate;
}

// Used to do a fetch request with query parameters but this wouldn't allow symbols, like the hash key.
// app.get("/sendSecret/:secret/:expiry/", async (req, res) => {
//   try {
//     // Get the secret from the post request
//     const secretContent = req.params.secret;
//     console.log(req.params);
    
//     // Encrypt the secret
//     const encryptedSecret = ncryptObject.encrypt(secretContent);
    
//     // Get the expiry days from the post request
//     const expiry = req.params.expiry;
  
//     // Get today's date
//     let today = new Date();
  
//     // Get expiry date
//     let expiryDate = getExpiryDate(today, expiry);
    
//     // Create an object with the secret
//     let obj = new Secret({
//       "secret": encryptedSecret,
//       "createdAt": today,
//       "expireAt": expiryDate,
//       "expireAfterSeconds": 0
//     });
    
//     // Save the object to MongoDB and return the _id to use as retrieval URL
//     const id = saveSecret(obj);
//     res.json({ "_id": id});
    
//   } catch {
//     res.status(500).send()
//   }
// });

app.post("/sendSecret/", async (req, res) => {
  try {
    // Get the secret from the post request
    const data = req.body;
    
    const secretContent = data.secret;
    
    // Encrypt the secret
    const encryptedSecret = ncryptObject.encrypt(secretContent);
    
    // Get the expiry days from the post request
    const expiry = data.expiry;
  
    // Get today's date
    let today = new Date();

    // Get expiry date
    let expiryDate = getExpiryDate(today, expiry);
    
    // Create an object with the secret
    let obj = new Secret({
      "secret": encryptedSecret,
      "createdAt": today,
      "expireAt": expiryDate,
      "expireAfterSeconds": 0
    });
    
    // Save the object to MongoDB and return the _id to use as retrieval URL
    const id = saveSecret(obj);
    res.json({ "_id": id});
    
  } catch {
    res.status(500).send()
  }
});

// Function to retrieve secret
app.get("/retrieveSecret/:id", async (req, res) => {
  // Get the ID parameter from the request
  const id = req.params.id;
  
  // Get the document from MongoDB
  const doc = await Secret.findById(id, (err, data) => {
    if (err) {
      res.json({"error": "Invalid url"})
    }
    return data
  }).clone().catch(function(err){ console.log(err) });
  if (doc === null) {
    return res.json({
      "error": "This URL doesn't exist"
    });
  } else {
    // Decrypt secret
    const encryptedSecret = doc.secret;
    const secret = ncryptObject.decrypt(encryptedSecret);
    // Delete secret from database
    deleteSecret(id);
    // Send secret
    return res.json({secret});
  }
});