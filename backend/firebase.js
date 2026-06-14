const admin = require('firebase-admin');

let credential;
let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = admin.credential.cert(serviceAccount);
  } catch (err) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', err.message);
  }
}

let firebaseAdminInstance;
let isMock = false;

if (credential) {
  try {
    admin.initializeApp({
      credential: credential,
      projectId: serviceAccount?.project_id || 'wherenow-2368e'
    });
    firebaseAdminInstance = admin;
    console.log('Firebase Admin initialized successfully with Service Account.');
  } catch (err) {
    console.error('Error initializing Firebase Admin with Service Account:', err.message);
    isMock = true;
  }
} else {
  console.warn('FIREBASE_SERVICE_ACCOUNT not configured. Using signature-less fallback token decoder (DEVELOPMENT ONLY).');
  isMock = true;
}

if (isMock) {
  const jwt = require('jsonwebtoken');
  
  firebaseAdminInstance = {
    auth: () => ({
      verifyIdToken: async (token) => {
        const decoded = jwt.decode(token);
        if (!decoded) {
          throw new Error('Invalid or unparseable Firebase ID token');
        }
        return {
          uid: decoded.user_id || decoded.sub,
          email: decoded.email,
          name: decoded.name || decoded.email?.split('@')[0] || 'Anonymous User',
          ...decoded
        };
      }
    })
  };
}

module.exports = firebaseAdminInstance;

