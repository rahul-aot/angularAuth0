const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');
const { isoUint8Array } = require('@simplewebauthn/server/helpers');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let users = {}; // In-memory user store

// Generate registration options
app.post('/register', (req, res) => {
  const username = req.body.username;
  console.log(username);
  const userId = uuidv4(); // Generate unique user ID

  const options = generateRegistrationOptions({
    rpName: "Your App Name",
    rpID: "localhost",
    userID: isoUint8Array.fromUTF8String(userId),
    userName: username,
    userDisplayName: username,
  });

  // Store user with challenge
  users[userId] = {
    username,
    challenge: options.challenge,
    credentials: []
  };
  console.log(users[userId]);
  console.log(options);
  res.json(options);
});

// Verify registration response
app.post('/verify-registration', (req, res) => {
  const { id, response } = req.body; // Expect `id` from client
  const user = users[id];

  if (!user) {
    return res.status(404).send('User not found');
  }

  const verification = verifyRegistrationResponse({
    response,
    expectedChallenge: user.challenge,
    expectedOrigin: "http://localhost:4200",
    expectedRPID: "localhost",
  });

  if (verification.verified) {
    user.credentials.push(verification.registrationInfo);
    res.status(200).send("Registration verified successfully!");
  } else {
    res.status(400).send("Verification failed.");
  }
});

// Generate authentication options
app.post('/login', (req, res) => {
  const username = req.body.username;
  const user = Object.values(users).find(u => u.username === username);

  if (!user) {
    return res.status(404).send("User not found");
  }

  const options = generateAuthenticationOptions({
    allowCredentials: user.credentials.map(cred => ({
      id: cred.credentialID,
      type: 'public-key',
    })),
  });

  // Store challenge for login verification
  user.challenge = options.challenge;
  res.json(options);
});

// Verify authentication response
app.post('/verify-login', (req, res) => {
  const { id, response } = req.body; // Expect `id` from client
  const user = users[id];

  if (!user) {
    return res.status(404).send('User not found');
  }

  const verification = verifyAuthenticationResponse({
    response,
    expectedChallenge: user.challenge,
    expectedOrigin: "http://localhost:4200",
    expectedRPID: "localhost",
  });

  if (verification.verified) {
    res.status(200).send("Login verified successfully!");
  } else {
    res.status(400).send("Login verification failed.");
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
