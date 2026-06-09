const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  radius: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['home', 'school', 'work', 'other'],
    default: 'other'
  }
}, { timestamps: true });

module.exports = mongoose.model('Geofence', geofenceSchema);
