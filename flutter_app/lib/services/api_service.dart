import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:firebase_auth/firebase_auth.dart' as fb_auth;
import '../models/user.dart';
import '../models/group.dart';
import '../models/location.dart';

class ApiService {
  final String baseUrl = 'https://wherenow-backend.onrender.com/api';

  Future<Map<String, String>> get _headers async {
    final user = fb_auth.FirebaseAuth.instance.currentUser;
    final token = user != null ? await user.getIdToken() : null;
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<User> syncUser(String name, {String role = 'member'}) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/sync'),
      headers: await _headers,
      body: jsonEncode({'name': name, 'role': role}),
    );
    if (response.statusCode >= 200 && response.statusCode < 300) {
       return User.fromJson(jsonDecode(response.body)['user']);
    }
    throw Exception('Failed to sync user: ${response.body}');
  }

  Future<User> getCurrentUser() async {
    final response = await http.get(
      Uri.parse('$baseUrl/auth/me'),
      headers: await _headers,
    );
    if (response.statusCode == 200) {
      return User.fromJson(jsonDecode(response.body));
    }
    throw Exception('Failed to get current user');
  }

  Future<Group> createGroup(String name) async {
    final response = await http.post(
      Uri.parse('$baseUrl/groups'),
      headers: await _headers,
      body: jsonEncode({'name': name}),
    );
    return Group.fromJson(jsonDecode(response.body));
  }

  Future<Group> joinGroup(String inviteCode) async {
    final response = await http.post(
      Uri.parse('$baseUrl/groups/join'),
      headers: await _headers,
      body: jsonEncode({'inviteCode': inviteCode}),
    );
    return Group.fromJson(jsonDecode(response.body));
  }

  Future<Group> getGroup(String groupId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/groups/$groupId'),
      headers: await _headers,
    );
    if (response.statusCode == 200) {
      return Group.fromJson(jsonDecode(response.body));
    }
    throw Exception('Failed to get group info');
  }

  Future<List<User>> getGroupMembers(String groupId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/groups/$groupId/members'),
      headers: await _headers,
    );
    final List<dynamic> data = jsonDecode(response.body);
    return data.map((json) => User.fromJson(json)).toList();
  }

  Future<void> updateMemberPermissions(String groupId, String memberId, Permissions permissions) async {
    await http.put(
      Uri.parse('$baseUrl/groups/$groupId/members/$memberId/permissions'),
      headers: await _headers,
      body: jsonEncode(permissions.toJson()),
    );
  }

  Future<void> removeMember(String groupId, String memberId) async {
    await http.delete(
      Uri.parse('$baseUrl/groups/$groupId/members/$memberId'),
      headers: await _headers,
    );
  }

  Future<void> sendLocation(double latitude, double longitude, double? accuracy, double? batteryLevel) async {
    await http.post(
      Uri.parse('$baseUrl/locations'),
      headers: await _headers,
      body: jsonEncode({
        'latitude': latitude,
        'longitude': longitude,
        'accuracy': accuracy,
        'batteryLevel': batteryLevel,
      }),
    );
  }

  Future<void> syncOfflineLocations(List<Map<String, dynamic>> locations, double? batteryLevel) async {
    await http.post(
      Uri.parse('$baseUrl/locations/sync'),
      headers: await _headers,
      body: jsonEncode({
        'locations': locations,
        'batteryLevel': batteryLevel,
      }),
    );
  }

  Future<List<Location>> getGroupLocations(String groupId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/locations/group/$groupId'),
      headers: await _headers,
    );
    final List<dynamic> data = jsonDecode(response.body);
    return data.map((json) => Location.fromJson(json)).toList();
  }

  Future<List<Location>> getUserLocationHistory(String userId, {DateTime? startDate, DateTime? endDate}) async {
    final Uri uri = Uri.parse('$baseUrl/locations/user/$userId/history').replace(
      queryParameters: {
        if (startDate != null) 'startDate': startDate.toIso8601String(),
        if (endDate != null) 'endDate': endDate.toIso8601String(),
      },
    );
    final response = await http.get(uri, headers: await _headers);
    final List<dynamic> data = jsonDecode(response.body);
    return data.map((json) => Location.fromJson(json)).toList();
  }

  Future<void> sendSOS(double latitude, double longitude) async {
    await http.post(
      Uri.parse('$baseUrl/sos'),
      headers: await _headers,
      body: jsonEncode({'latitude': latitude, 'longitude': longitude}),
    );
  }
}
