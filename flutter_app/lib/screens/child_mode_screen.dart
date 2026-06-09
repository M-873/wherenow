import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:permission_handler/permission_handler.dart';
import '../providers/auth_provider.dart';
import 'join_group_screen.dart';

class ChildModeScreen extends StatefulWidget {
  const ChildModeScreen({super.key});

  @override
  State<ChildModeScreen> createState() => _ChildModeScreenState();
}

class _ChildModeScreenState extends State<ChildModeScreen> with SingleTickerProviderStateMixin {
  bool _safeModeActive = false;
  bool _permissionsGranted = false;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    );
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
    _checkPermissions();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _checkPermissions() async {
    final locStatus = await Permission.locationAlways.status;
    final notifStatus = await Permission.notification.status;
    setState(() {
      _permissionsGranted = locStatus.isGranted && notifStatus.isGranted;
    });
  }

  Future<void> _requestPermissions() async {
    final statuses = await [
      Permission.locationAlways,
      Permission.notification,
    ].request();

    setState(() {
      _permissionsGranted = statuses[Permission.locationAlways]!.isGranted &&
          statuses[Permission.notification]!.isGranted;
    });
  }

  void _toggleSafeMode() {
    if (!_permissionsGranted) {
      _requestPermissions();
      return;
    }
    setState(() {
      _safeModeActive = !_safeModeActive;
      if (_safeModeActive) {
        _pulseController.repeat(reverse: true);
        // Start background service here
      } else {
        _pulseController.stop();
        _pulseController.reset();
        // Stop background service here
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, child) {
        if (auth.user?.groupId == null) {
          return const JoinGroupScreen();
        }

        return Scaffold(
          backgroundColor: _safeModeActive ? const Color(0xFFF0FDF4) : Colors.white,
          appBar: AppBar(
            backgroundColor: Colors.transparent,
            elevation: 0,
            title: const Text('WhereNow', style: TextStyle(color: Colors.black87)),
            actions: [
              IconButton(
                icon: const Icon(Icons.logout, color: Colors.black54),
                onPressed: () => auth.logout(),
              ),
            ],
          ),
          body: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Column(
                    children: [
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 500),
                        transitionBuilder: (Widget child, Animation<double> animation) {
                          return ScaleTransition(scale: animation, child: child);
                        },
                        child: Icon(
                          _safeModeActive ? Icons.shield : Icons.shield_outlined,
                          key: ValueKey<bool>(_safeModeActive),
                          size: 100,
                          color: _safeModeActive ? Colors.green.shade600 : Colors.grey.shade400,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _safeModeActive ? 'Safe Mode Active' : 'Safe Mode Inactive',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              color: _safeModeActive ? Colors.green.shade700 : Colors.grey.shade600,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      if (_safeModeActive)
                        const Padding(
                          padding: EdgeInsets.only(top: 8.0),
                          child: Text('Your location is being shared securely', style: TextStyle(color: Colors.black54)),
                        )
                    ],
                  ),
                  
                  AnimatedBuilder(
                    animation: _pulseAnimation,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: _safeModeActive ? _pulseAnimation.value : 1.0,
                        child: GestureDetector(
                          onTap: _toggleSafeMode,
                          child: Container(
                            width: 240,
                            height: 240,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: LinearGradient(
                                colors: _safeModeActive
                                    ? [Colors.green.shade400, Colors.green.shade600]
                                    : [Colors.blue.shade400, Colors.blue.shade600],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: (_safeModeActive ? Colors.green : Colors.blue).withOpacity(0.4),
                                  blurRadius: 30,
                                  spreadRadius: _safeModeActive ? 15 : 5,
                                )
                              ],
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  _safeModeActive ? Icons.stop_rounded : Icons.play_arrow_rounded,
                                  size: 80,
                                  color: Colors.white,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  _safeModeActive ? 'STOP' : 'START\nSAFE MODE',
                                  style: const TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.white,
                                    letterSpacing: 1.2,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                  
                  Column(
                    children: [
                      if (!_permissionsGranted)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 24.0),
                          child: OutlinedButton.icon(
                            onPressed: _requestPermissions,
                            icon: const Icon(Icons.settings),
                            label: const Text('Grant Required Permissions'),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                      SizedBox(
                        width: double.infinity,
                        height: 64,
                        child: ElevatedButton(
                          onPressed: _safeModeActive ? _sendSOS : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red.shade600,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                            elevation: _safeModeActive ? 8 : 0,
                          ),
                          child: const Text(
                            'SOS EMERGENCY',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 2.0,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Future<void> _sendSOS() async {
    try {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.warning, color: Colors.white),
              SizedBox(width: 12),
              Text('SOS Alert Sent to Host!', style: TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
          backgroundColor: Colors.red.shade700,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }
}
