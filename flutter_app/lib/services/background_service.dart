import 'dart:async';
import 'dart:ui';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:location/location.dart' as loc;
import 'package:firebase_core/firebase_core.dart';
import 'package:battery_plus/battery_plus.dart';
import 'offline_storage.dart';
import 'api_service.dart';

Future<void> initializeService() async {
  final service = FlutterBackgroundService();

  const AndroidNotificationChannel channel = AndroidNotificationChannel(
    'wherenow_tracking',
    'WhereNow Tracking Service',
    description: 'This channel is used for tracking your location in the background.',
    importance: Importance.low,
  );

  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  await flutterLocalNotificationsPlugin
      .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
      ?.createNotificationChannel(channel);

  await service.configure(
    androidConfiguration: AndroidConfiguration(
      onStart: onStart,
      autoStart: false,
      isForegroundMode: true,
      notificationChannelId: 'wherenow_tracking',
      initialNotificationTitle: 'WhereNow Safe Mode',
      initialNotificationContent: 'Tracking is active',
      foregroundServiceNotificationId: 888,
    ),
    iosConfiguration: IosConfiguration(
      autoStart: false,
      onForeground: onStart,
      onBackground: onIosBackground,
    ),
  );
}

@pragma('vm:entry-point')
Future<bool> onIosBackground(ServiceInstance service) async {
  return true;
}

@pragma('vm:entry-point')
void onStart(ServiceInstance service) async {
  DartPluginRegistrant.ensureInitialized();
  
  try {
    await Firebase.initializeApp();
  } catch (e) {
    print('Failed to initialize Firebase inside background service: $e');
  }

  final location = loc.Location();
  final apiService = ApiService();

  service.on('stopService').listen((event) {
    service.stopSelf();
  });

  // Check every 30 seconds
  Timer.periodic(const Duration(seconds: 30), (timer) async {
    if (service is AndroidServiceInstance) {
      if (await service.isForegroundService()) {
        try {
          final locationData = await location.getLocation();
          
          double? batteryLevel;
          try {
            final level = await Battery().batteryLevel;
            batteryLevel = level.toDouble();
          } catch (e) {
            print('Could not get battery level: $e');
          }

          // Try to sync directly if online
          try {
            await apiService.sendLocation(
              locationData.latitude!,
              locationData.longitude!,
              locationData.accuracy,
              batteryLevel,
            );

            // If we successfully sent current location, check if there are offline locations to sync
            final pending = await OfflineStorage.getPendingLocations();
            if (pending.isNotEmpty) {
              await apiService.syncOfflineLocations(pending, batteryLevel);
              await OfflineStorage.clearPendingLocations();
            }
          } catch (e) {
            // Offline - save to SQLite
            await OfflineStorage.saveLocation(
              locationData.latitude!,
              locationData.longitude!,
              locationData.accuracy,
            );
          }
        } catch (e) {
          print('Background location error: $e');
        }
      }
    }
  });
}
