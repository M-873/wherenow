import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class OfflineStorage {
  static Database? _db;

  static Future<Database> get database async {
    if (_db != null) return _db!;
    _db = await _initDB('wherenow_offline.db');
    return _db!;
  }

  static Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  static Future<void> _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        accuracy REAL,
        timestamp TEXT NOT NULL
      )
    ''');
  }

  static Future<void> saveLocation(double lat, double lng, double? accuracy) async {
    final db = await database;
    await db.insert('locations', {
      'latitude': lat,
      'longitude': lng,
      'accuracy': accuracy,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  static Future<List<Map<String, dynamic>>> getPendingLocations() async {
    final db = await database;
    return await db.query('locations', orderBy: 'timestamp ASC');
  }

  static Future<void> clearPendingLocations() async {
    final db = await database;
    await db.delete('locations');
  }
}
