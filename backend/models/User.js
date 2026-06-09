const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['host', 'member'],
    required: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  permissions: {
    viewAllLocations: { type: Boolean, default: false },
    mapAccess: { type: Boolean, default: false },
    receiveSOSAlerts: { type: Boolean, default: false },
    receiveGeofenceAlerts: { type: Boolean, default: false },
    receiveBatteryAlerts: { type: Boolean, default: false },
    trackingEnabled: { type: Boolean, default: true }
  },
  batteryLevel: {
    type: Number,
    default: null
  },
  lastSeen: {
    type: Date,
    default: null
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
