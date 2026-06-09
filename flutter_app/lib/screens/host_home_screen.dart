import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../providers/auth_provider.dart';
import '../providers/location_provider.dart';
import 'create_group_screen.dart';
import 'members_screen.dart';

class HostHomeScreen extends StatefulWidget {
  const HostHomeScreen({super.key});

  @override
  State<HostHomeScreen> createState() => _HostHomeScreenState();
}

class _HostHomeScreenState extends State<HostHomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const MapScreen(),
    const MembersScreen(),
    const SettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('WhereNow - Host'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => Provider.of<AuthProvider>(context, listen: false).logout(),
          ),
        ],
      ),
      body: Consumer<AuthProvider>(
        builder: (context, auth, child) {
          if (auth.user?.groupId == null) {
            return const CreateGroupScreen();
          }
          return _screens[_selectedIndex];
        },
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.map),
            label: 'Map',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people),
            label: 'Members',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
      ),
    );
  }
}

class MapScreen extends StatelessWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    return ChangeNotifierProvider(
      create: (_) => LocationProvider(auth.apiService!),
      child: Consumer<LocationProvider>(
        builder: (context, locationProvider, child) {
          if (auth.user?.groupId != null && locationProvider.locations.isEmpty) {
            locationProvider.loadGroupLocations(auth.user!.groupId!);
          }

          final List<LatLng> historyPoints = locationProvider.historyLocations
              .map((loc) => LatLng(loc.latitude, loc.longitude))
              .toList();

          return Stack(
            children: [
              FlutterMap(
                options: MapOptions(
                  initialCenter: const LatLng(51.5, -0.09),
                  initialZoom: 13,
                ),
                children: [
                  TileLayer(
                    urlTemplate: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
                    userAgentPackageName: 'com.wherenow',
                  ),
                  if (historyPoints.isNotEmpty)
                    PolylineLayer(
                      polylines: [
                        Polyline(
                          points: historyPoints,
                          color: Colors.blue.shade700,
                          strokeWidth: 4.0,
                          isDotted: true,
                        ),
                      ],
                    ),
                  MarkerLayer(
                    markers: locationProvider.locations.map((loc) {
                      final isSelected = locationProvider.selectedUserIdForHistory == loc.userId.id;
                      return Marker(
                        point: LatLng(loc.latitude, loc.longitude),
                        width: 60,
                        height: 60,
                        child: GestureDetector(
                          onTap: () {
                            if (isSelected) {
                              locationProvider.clearHistory();
                            } else {
                              locationProvider.loadUserHistory(loc.userId.id);
                            }
                          },
                          child: Column(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: isSelected ? Colors.blue.shade100 : Colors.white,
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black26,
                                      blurRadius: 8,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                  border: Border.all(color: Colors.blue.shade700, width: isSelected ? 3 : 2),
                                ),
                                child: Icon(Icons.person, color: Colors.blue.shade700, size: 24),
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
              if (locationProvider.selectedUserIdForHistory != null)
                Positioned(
                  top: 16,
                  left: 16,
                  right: 16,
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Viewing 24h Route History', style: TextStyle(fontWeight: FontWeight.bold)),
                          IconButton(
                            icon: const Icon(Icons.close),
                            onPressed: () => locationProvider.clearHistory(),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('Welcome, ${auth.user?.name}'),
          const SizedBox(height: 16),
          Text('Group ID: ${auth.user?.groupId}'),
        ],
      ),
    );
  }
}
