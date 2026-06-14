import 'package:flutter/foundation.dart';
import 'package:firebase_auth/firebase_auth.dart' as fb_auth;
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  ApiService? _apiService;
  bool _isLoading = true;

  User? get user => _user;
  ApiService? get apiService => _apiService;
  bool get isAuthenticated => fb_auth.FirebaseAuth.instance.currentUser != null && _user != null;
  bool get isHost => _user?.role == 'host';
  bool get isLoading => _isLoading;

  AuthProvider() {
    _apiService = ApiService();
    fb_auth.FirebaseAuth.instance.authStateChanges().listen((fbUser) {
      if (fbUser != null) {
        _syncUser();
      } else {
        _user = null;
        _isLoading = false;
        notifyListeners();
      }
    });
  }

  Future<void> _syncUser() async {
    try {
      _isLoading = true;
      notifyListeners();
      _user = await _apiService!.getCurrentUser();
    } catch (e) {
      // User might not exist in MongoDB yet if just registered,
      // or backend is down. Registration flow handles explicit sync.
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> getCurrentUser() async {
    await _syncUser();
  }

  Future<bool> register(String name, String email, String password, String role) async {
    try {
      await fb_auth.FirebaseAuth.instance.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      _user = await _apiService!.syncUser(name, role: role);
      notifyListeners();
      return true;
    } catch (e) {
      print('Registration error: $e');
      return false;
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      await fb_auth.FirebaseAuth.instance.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      _user = await _apiService!.getCurrentUser();
      notifyListeners();
      return true;
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }

  Future<void> logout() async {
    await fb_auth.FirebaseAuth.instance.signOut();
    _user = null;
    notifyListeners();
  }
}
