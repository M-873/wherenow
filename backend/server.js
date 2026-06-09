const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const locationRoutes = require('./routes/locations');
const sosRoutes = require('./routes/sos');
const geofenceRoutes = require('./routes/geofences');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/geofences', geofenceRoutes);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const admin = require('./firebase');
const User = require('./models/User');

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ email: decodedToken.email });
    if (!user) return next(new Error('User not found'));
    
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.user.name);

  socket.on('join-group', (groupId) => {
    // Only allow joining if user belongs to this group
    if (socket.user.groupId && socket.user.groupId.toString() === groupId) {
      socket.join(`group-${groupId}`);
      
      const p = socket.user.permissions;
      const isHost = socket.user.role === 'host';
      
      if (isHost || p.viewAllLocations) socket.join(`group-${groupId}-locations`);
      if (isHost || p.receiveSOSAlerts) socket.join(`group-${groupId}-sos`);
      if (isHost || p.receiveGeofenceAlerts) socket.join(`group-${groupId}-geofences`);
    }
  });

  socket.on('update-location', (data) => {
    // Only broadcast if tracking is enabled
    if (socket.user.permissions.trackingEnabled) {
      io.to(`group-${data.groupId}-locations`).emit('location-updated', data);
    }
  });

  socket.on('sos-alert', (data) => {
    io.to(`group-${data.groupId}-sos`).emit('sos-received', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.name);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
