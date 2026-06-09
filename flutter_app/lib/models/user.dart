class User {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? groupId;
  final Permissions permissions;
  final double? batteryLevel;
  final DateTime? lastSeen;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.groupId,
    required this.permissions,
    this.batteryLevel,
    this.lastSeen,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'],
      name: json['name'],
      email: json['email'],
      role: json['role'],
      groupId: json['groupId'],
      permissions: Permissions.fromJson(json['permissions']),
      batteryLevel: json['batteryLevel']?.toDouble(),
      lastSeen: json['lastSeen'] != null ? DateTime.parse(json['lastSeen']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'email': email,
      'role': role,
      'groupId': groupId,
      'permissions': permissions.toJson(),
      'batteryLevel': batteryLevel,
      'lastSeen': lastSeen?.toIso8601String(),
    };
  }
}

class Permissions {
  final bool viewAllLocations;
  final bool mapAccess;
  final bool receiveSOSAlerts;
  final bool receiveGeofenceAlerts;
  final bool receiveBatteryAlerts;
  final bool trackingEnabled;

  Permissions({
    required this.viewAllLocations,
    required this.mapAccess,
    required this.receiveSOSAlerts,
    required this.receiveGeofenceAlerts,
    required this.receiveBatteryAlerts,
    required this.trackingEnabled,
  });

  factory Permissions.fromJson(Map<String, dynamic> json) {
    return Permissions(
      viewAllLocations: json['viewAllLocations'] ?? false,
      mapAccess: json['mapAccess'] ?? false,
      receiveSOSAlerts: json['receiveSOSAlerts'] ?? false,
      receiveGeofenceAlerts: json['receiveGeofenceAlerts'] ?? false,
      receiveBatteryAlerts: json['receiveBatteryAlerts'] ?? false,
      trackingEnabled: json['trackingEnabled'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'viewAllLocations': viewAllLocations,
      'mapAccess': mapAccess,
      'receiveSOSAlerts': receiveSOSAlerts,
      'receiveGeofenceAlerts': receiveGeofenceAlerts,
      'receiveBatteryAlerts': receiveBatteryAlerts,
      'trackingEnabled': trackingEnabled,
    };
  }
}
