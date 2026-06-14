const express = require('express');
const crypto = require('crypto');
const Group = require('../models/Group');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'host') {
      return res.status(403).json({ message: 'Only hosts can create groups' });
    }

    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const group = new Group({
      name: req.body.name,
      hostId: req.user._id,
      inviteCode,
      members: [req.user._id]
    });

    await group.save();
    req.user.groupId = group._id;
    await req.user.save();

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/join', auth, async (req, res) => {
  try {
    const group = await Group.findOne({ inviteCode: req.body.inviteCode });
    if (!group) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    req.user.groupId = group._id;
    await req.user.save();

    if (!group.members.includes(req.user._id)) {
      group.members.push(req.user._id);
      await group.save();
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:groupId/members', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('members', '-password');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    res.json(group.members);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:groupId/members/:memberId/permissions', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group || group.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const member = await User.findById(req.params.memberId);
    if (!member || member.groupId.toString() !== req.params.groupId) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.permissions = { ...member.permissions, ...req.body };
    await member.save();

    res.json({ ...member.toObject(), password: undefined });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:groupId/members/:memberId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group || group.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const member = await User.findById(req.params.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.groupId = null;
    await member.save();
    group.members = group.members.filter(id => id.toString() !== req.params.memberId);
    await group.save();

    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
