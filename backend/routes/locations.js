const express = require('express');
const Location = require('../models/Location');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    if (!req.user.permissions.trackingEnabled) {
      return res.status(403).json({ message: 'Tracking disabled' });
    }

    const location = new Location({
      userId: req.user._id,
      groupId: req.user.groupId,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      accuracy: req.body.accuracy
    });

    await location.save();

    req.user.lastSeen = new Date();
    req.user.batteryLevel = req.body.batteryLevel;
    await req.user.save();

    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/sync', auth, async (req, res) => {
  try {
    if (!req.user.permissions.trackingEnabled) {
      return res.status(403).json({ message: 'Tracking disabled' });
    }

    const locationsData = req.body.locations;
    if (!Array.isArray(locationsData) || locationsData.length === 0) {
      return res.status(400).json({ message: 'Invalid locations data' });
    }

    const locationsToInsert = locationsData.map(loc => ({
      userId: req.user._id,
      groupId: req.user.groupId,
      latitude: loc.latitude,
      longitude: loc.longitude,
      accuracy: loc.accuracy,
      timestamp: loc.timestamp || new Date()
    }));

    await Location.insertMany(locationsToInsert);

    req.user.lastSeen = new Date();
    if (req.body.batteryLevel !== undefined) {
      req.user.batteryLevel = req.body.batteryLevel;
    }
    await req.user.save();

    res.status(201).json({ message: 'Sync successful', count: locationsToInsert.length });
  } catch (error) {
    console.error('Location sync error:', error);
    res.status(500).json({ message: 'Server error during sync' });
  }
});

router.get('/group/:groupId', auth, async (req, res) => {
  try {
    if (req.user.groupId.toString() !== req.params.groupId) {
      return res.status(403).json({ message: 'Not in this group' });
    }

    const canViewAll = req.user.role === 'host' || req.user.permissions.viewAllLocations;
    const userIds = canViewAll ? undefined : [req.user._id];

    const locations = await Location.find({
      groupId: req.params.groupId,
      ...(userIds && { userId: { $in: userIds } })
    }).sort({ timestamp: -1 }).populate('userId', 'name');

    const latestLocations = {};
    locations.forEach(loc => {
      const userId = loc.userId._id.toString();
      if (!latestLocations[userId] || new Date(loc.timestamp) > new Date(latestLocations[userId].timestamp)) {
        latestLocations[userId] = loc;
      }
    });

    res.json(Object.values(latestLocations));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/user/:userId/history', auth, async (req, res) => {
  try {
    if (req.user.role !== 'host' && req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { startDate, endDate } = req.query;
    const query = { userId: req.params.userId };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const locations = await Location.find(query).sort({ timestamp: 1 });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
