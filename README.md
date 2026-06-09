# WhereNow - Family Safety & Location Tracking

A modern Android mobile application for family safety and real-time location tracking.

## Features

### 👑 Host (Admin) Features
- Create and manage family/group spaces
- Invite and remove members using invite codes
- View real-time live locations of all members on a map
- View full movement history (route tracking)
- Receive SOS emergency alerts from members
- Receive geofence entry/exit notifications
- Monitor battery status and last seen time of all members
- Control detailed permissions for each member individually

### 👤 Member Features
- Join a family/group using an invite code
- Share real-time GPS location in the background
- Automatically sync location data when internet becomes available
- Send SOS emergency alerts to the Host
- View only allowed information based on Host permissions
- Run tracking in background mode securely

### 👶 Simplified Child Mode (One-Tap System)
- Extremely simple interface designed for non-technical users
- Single large "Start Safe Mode" button
- One-time setup for permissions
- Clear status indicator when Safe Mode is active

## Tech Stack

### Backend
- Node.js + Express
- MongoDB
- Socket.IO (real-time communication)
- JWT (authentication)

### Frontend (Flutter App)
- Flutter (Android)
- Provider (state management)
- flutter_map + OpenStreetMap
- location (GPS tracking)
- permission_handler
- socket_io_client

## Project Structure

```
keep-safe-now/
├── backend/               # Node.js + Express backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   ├── server.js         # Entry point
│   └── package.json
└── flutter_app/          # Flutter Android app
    ├── lib/
    │   ├── models/       # Data models
    │   ├── providers/    # State management
    │   ├── screens/      # UI screens
    │   ├── services/     # API services
    │   ├── widgets/      # Reusable widgets
    │   └── main.dart     # Entry point
    ├── android/          # Android configuration
    └── pubspec.yaml
```

## Getting Started

### Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create a `.env` file (already provided):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wherenow
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

3. Start MongoDB locally

4. Run the server:
```bash
npm start
```

### Flutter App Setup

1. Install Flutter SDK

2. Install dependencies:
```bash
cd flutter_app
flutter pub get
```

3. Run the app:
```bash
flutter run
```

## License

MIT
