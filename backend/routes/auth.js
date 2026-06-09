const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Sync user from Firebase to MongoDB
router.post('/sync', auth, async (req, res) => {
  try {
    const { name, role } = req.body; // Role only passed during first registration
    
    // If the user already exists (found in auth middleware)
    if (req.user) {
      return res.json({ user: { ...req.user.toObject(), password: undefined } });
    }
    
    // If the user doesn't exist, req.firebaseUser has the decoded token
    if (!req.firebaseUser) {
      return res.status(401).json({ message: 'No valid Firebase user found' });
    }

    const newUser = new User({
      name: name || req.firebaseUser.name || 'Anonymous User',
      email: req.firebaseUser.email,
      password: 'firebase-managed-password', // Dummy password since it's required by the model
      role: role || 'member' // Default to member
    });

    if (newUser.role === 'host') {
      newUser.permissions = {
        viewAllLocations: true,
        mapAccess: true,
        receiveSOSAlerts: true,
        receiveGeofenceAlerts: true,
        receiveBatteryAlerts: true,
        trackingEnabled: true
      };
    }
    await newUser.save();

    res.status(201).json({ user: { ...newUser.toObject(), password: undefined } });
  } catch (error) {
    console.error('Sync Error:', error);
    res.status(500).json({ message: 'Server error during sync' });
  }
});

router.get('/me', auth, async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: 'User not found in DB' });
  }
  res.json({ ...req.user.toObject(), password: undefined });
});

module.exports = router;
