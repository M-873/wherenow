const admin = require('../firebase');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    let user = await User.findOne({ email: decodedToken.email });
    
    // If the user authenticated via Firebase but doesn't exist in MongoDB yet, we can't attach req.user.
    // The client should call /api/auth/sync first.
    if (user) {
      req.user = user;
    } else {
      req.firebaseUser = decodedToken;
    }
    
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
