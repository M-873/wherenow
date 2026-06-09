const express = require('express');
const SOS = require('../models/SOS');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const sos = new SOS({
      userId: req.user._id,
      groupId: req.user.groupId,
      latitude: req.body.latitude,
      longitude: req.body.longitude
    });

    await sos.save();
    res.status(201).json(sos);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/group/:groupId', auth, async (req, res) => {
  try {
    if (req.user.groupId.toString() !== req.params.groupId) {
      return res.status(403).json({ message: 'Not in this group' });
    }

    const sosAlerts = await SOS.find({ groupId: req.params.groupId })
      .sort({ timestamp: -1 })
      .populate('userId', 'name');

    res.json(sosAlerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:sosId/acknowledge', auth, async (req, res) => {
  try {
    const sos = await SOS.findById(req.params.sosId);
    if (!sos) {
      return res.status(404).json({ message: 'SOS alert not found' });
    }

    sos.acknowledged = true;
    await sos.save();
    res.json(sos);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
