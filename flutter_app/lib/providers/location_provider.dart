import 'package:flutter/foundation.dart';
import '../models/location.dart';
import '../services/api_service.dart';

class LocationProvider with ChangeNotifier {
  final ApiService apiService;
  List<Location> _locations = [];
  List<Location> _historyLocations = [];
  String? _selectedUserIdForHistory;
  bool _isTracking = false;

  List<Location> get locations => _locations;
  List<Location> get historyLocations => _historyLocations;
  String? get selectedUserIdForHistory => _selectedUserIdForHistory;
  bool get isTracking => _isTracking;

  LocationProvider(this.apiService);

  Future<void> loadGroupLocations(String groupId) async {
    try {
      _locations = await apiService.getGroupLocations(groupId);
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading locations: $e');
    }
  }

  Future<void> loadUserHistory(String userId) async {
    try {
      _selectedUserIdForHistory = userId;
      // Get history for the last 24 hours
      final yesterday = DateTime.now().subtract(const Duration(hours: 24));
      _historyLocations = await apiService.getUserLocationHistory(userId, startDate: yesterday);
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading history: $e');
    }
  }

  void clearHistory() {
    _selectedUserIdForHistory = null;
    _historyLocations = [];
    notifyListeners();
  }

  Future<void> sendLocation(double latitude, double longitude, double? accuracy, double? batteryLevel) async {
    try {
      await apiService.sendLocation(latitude, longitude, accuracy, batteryLevel);
    } catch (e) {
      debugPrint('Error sending location: $e');
    }
  }

  void setTracking(bool value) {
    _isTracking = value;
    notifyListeners();
  }
}
