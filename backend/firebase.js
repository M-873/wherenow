const admin = require('firebase-admin');

// We only need to verify tokens, so we can initialize the SDK 
// using just the Project ID. No secret Service Account JSON is required!
admin.initializeApp({
  projectId: 'wherenow-2368e'
});

module.exports = admin;
