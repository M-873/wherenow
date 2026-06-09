const admin = require('firebase-admin');

// Initialize Firebase Admin with full credentials for FCM support
let credential;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = admin.credential.cert(serviceAccount);
  } catch (err) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT');
  }
}

admin.initializeApp({
  credential: credential,
  projectId: 'wherenow-2368e'
});

module.exports = admin;
