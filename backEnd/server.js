const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

const app = express();
const PORT = process.env.PORT || 3001; // Changed port to avoid conflicts

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:4200', // Angular default port
  credentials: true
}));

// In-memory user storage (replace with database in production)
const USERS = [];

// Helper functions
function getUserByEmail(email) {
  return USERS.find(user => user.email === email);
}

function getUserById(id) {
  return USERS.find(user => user.id === id);
}

function createUser(id, email, passKey) {
  USERS.push({ id, email, passKey });
}

function updateUserCounter(id, counter) {
  const user = USERS.find(user => user.id === id);
  if (user) {
    user.passKey.counter = counter;
  }
}

// WebAuthn Registration Routes
app.get('/init-register', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (getUserByEmail(email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const options = await generateRegistrationOptions({
    rpName: 'WebAuthn Demo',
    rpID: 'localhost',
    userName: email,
    userDisplayName: email,
  });

  res.cookie('registrationChallenge', JSON.stringify({
    challenge: options.challenge,
    userId: options.user.id,
    email
  }), {
    httpOnly: true,
    secure: false, // Set to true in production
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000 // 5 minutes
  });

  res.json(options);
});

app.post('/verify-register', async (req, res) => {
  const registrationCookie = req.cookies.registrationChallenge;
  
  if (!registrationCookie) {
    return res.status(400).json({ error: 'No registration challenge found' });
  }

  const { challenge, userId, email } = JSON.parse(registrationCookie);

  try {
    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge: challenge,
      expectedOrigin: 'http://localhost:4200',
      expectedRPID: 'localhost',
    });

    if (verification.verified) {
      createUser(userId, email, {
        id: verification.registrationInfo.credentialID,
        publicKey: verification.registrationInfo.credentialPublicKey,
        counter: verification.registrationInfo.counter,
      });

      res.clearCookie('registrationChallenge');
      return res.json({ verified: true });
    }

    return res.status(400).json({ verified: false, error: 'Registration verification failed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

// WebAuthn Authentication Routes
app.get('/init-auth', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const options = await generateAuthenticationOptions({
    rpID: 'localhost',
    allowCredentials: [{
      id: user.passKey.id,
      type: 'public-key',
    }],
  });

  res.cookie('authChallenge', JSON.stringify({
    challenge: options.challenge,
    userId: user.id
  }), {
    httpOnly: true,
    secure: false, // Set to true in production
    sameSite: 'lax',
    maxAge: 5 * 60 * 1000 // 5 minutes
  });

  res.json(options);
});

app.post('/verify-auth', async (req, res) => {
  const authCookie = req.cookies.authChallenge;
  
  if (!authCookie) {
    return res.status(400).json({ error: 'No authentication challenge found' });
  }

  const { challenge, userId } = JSON.parse(authCookie);
  const user = getUserById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response: req.body,
      expectedChallenge: challenge,
      expectedOrigin: 'http://localhost:4200',
      expectedRPID: 'localhost',
      authenticator: {
        credentialID: user.passKey.id,
        credentialPublicKey: user.passKey.publicKey,
        counter: user.passKey.counter,
      },
    });

    if (verification.verified) {
      updateUserCounter(userId, verification.authenticationInfo.newCounter);
      res.clearCookie('authChallenge');
      return res.json({ verified: true });
    }

    return res.status(400).json({ verified: false, error: 'Authentication verification failed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error during authentication' });
  }
});

// Error handling for port in use
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Please kill the process or change the port.`);
    process.exit(1);
  }
});

module.exports = app;