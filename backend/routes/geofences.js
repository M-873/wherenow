const express = require('express');
const Geofence = require('../models/Geofence');
const Group = require('../models/Group');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.body.groupId);
    if (!group || group.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const geofence = new Geofence(req.body);
    await geofence.save();
    res.status(201).json(geofence);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/group/:groupId', auth, async (req, res) => {
  try {
    if (req.user.groupId.toString() !== req.params.groupId) {
      return res.status(403).json({ message: 'Not in this group' });
    }

    const geofences = await Geofence.find({ groupId: req.params.groupId });
    res.json(geofences);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:geofenceId', auth, async (req, res) => {
  try {
    const geofence = await Geofence.findById(req.params.geofenceId);
    if (!geofence) {
      return res.status(404).json({ message: 'Geofence not found' });
    }

    const group = await Group.findById(geofence.groupId);
    if (!group || group.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Geofence.findByIdAndDelete(req.params.geofenceId);
    res.json({ message: 'Geofence deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
