import 'user.dart';

class Location {
  final String id;
  final String userId;
  final String groupId;
  final double latitude;
  final double longitude;
  final double? accuracy;
  final DateTime timestamp;
  final User? user;

  Location({
    required this.id,
    required this.userId,
    required this.groupId,
    required this.latitude,
    required this.longitude,
    this.accuracy,
    required this.timestamp,
    this.user,
  });

  factory Location.fromJson(Map<String, dynamic> json) {
    return Location(
      id: json['_id'],
      userId: json['userId'],
      groupId: json['groupId'],
      latitude: json['latitude'].toDouble(),
      longitude: json['longitude'].toDouble(),
      accuracy: json['accuracy']?.toDouble(),
      timestamp: DateTime.parse(json['timestamp']),
      user: json['userId'] is Map ? User.fromJson(json['userId']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'userId': userId,
      'groupId': groupId,
      'latitude': latitude,
      'longitude': longitude,
      'accuracy': accuracy,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
