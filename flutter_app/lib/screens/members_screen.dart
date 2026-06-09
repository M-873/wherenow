import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../models/user.dart';

class MembersScreen extends StatefulWidget {
  const MembersScreen({super.key});

  @override
  State<MembersScreen> createState() => _MembersScreenState();
}

class _MembersScreenState extends State<MembersScreen> {
  final TextEditingController _inviteCodeController = TextEditingController();
  List<User> _members = [];

  @override
  void initState() {
    super.initState();
    _loadMembers();
  }

  Future<void> _loadMembers() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (auth.user?.groupId != null) {
      try {
        final members = await auth.apiService!.getGroupMembers(auth.user!.groupId!);
        if (mounted) {
          setState(() => _members = members);
        }
      } catch (e) {
        debugPrint('Error loading members: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        child: const Icon(Icons.person_add),
        onPressed: () => _showInviteDialog(context),
      ),
      body: _members.isEmpty
          ? const Center(child: Text('No members yet'))
          : ListView.builder(
              itemCount: _members.length,
              itemBuilder: (context, index) {
                final member = _members[index];
                return ListTile(
                  leading: Stack(
                    alignment: Alignment.bottomRight,
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundColor: member.role == 'host' ? Colors.blue.shade100 : Colors.green.shade100,
                        child: Text(
                          member.name[0].toUpperCase(),
                          style: TextStyle(
                            color: member.role == 'host' ? Colors.blue.shade800 : Colors.green.shade800,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      if (member.batteryLevel != null)
                        Container(
                          padding: const EdgeInsets.all(2),
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            member.batteryLevel! > 20 ? Icons.battery_full : Icons.battery_alert,
                            size: 16,
                            color: member.batteryLevel! > 20 ? Colors.green : Colors.red,
                          ),
                        ),
                    ],
                  ),
                  title: Text(member.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(member.role.toUpperCase(), style: TextStyle(fontSize: 12, color: Colors.blue.shade700)),
                      if (member.lastSeen != null)
                        Text(
                          'Last seen: ${_formatLastSeen(member.lastSeen!)}',
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                    ],
                  ),
                  trailing: member.role == 'host'
                      ? null
                      : PopupMenuButton(
                          itemBuilder: (context) => [
                            const PopupMenuItem(
                              value: 'permissions',
                              child: Text('Permissions'),
                            ),
                            const PopupMenuItem(
                              value: 'remove',
                              child: Text('Remove'),
                            ),
                          ],
                          onSelected: (value) {
                            if (value == 'remove') {
                              _removeMember(member.id);
                            } else if (value == 'permissions') {
                              _showPermissionsDialog(member);
                            }
                          },
                        ),
                );
              },
            ),
    );
  }

  void _showInviteDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Invite Code'),
        content: Consumer<AuthProvider>(
          builder: (context, auth, child) {
            return FutureBuilder(
              future: auth.apiService?.getGroupMembers(auth.user!.groupId!),
              builder: (context, snapshot) {
                return const Text('Share this code with members to join');
              },
            );
          },
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Future<void> _removeMember(String memberId) async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    try {
      await auth.apiService!.removeMember(auth.user!.groupId!, memberId);
      _loadMembers();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  String _formatLastSeen(DateTime lastSeen) {
    final diff = DateTime.now().difference(lastSeen);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inHours < 1) return '${diff.inMinutes}m ago';
    if (diff.inDays < 1) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }

  void _showPermissionsDialog(User member) {
    showDialog(
      context: context,
      builder: (context) => PermissionsDialog(member: member),
    );
  }
}

class PermissionsDialog extends StatefulWidget {
  final User member;

  const PermissionsDialog({super.key, required this.member});

  @override
  State<PermissionsDialog> createState() => _PermissionsDialogState();
}

class _PermissionsDialogState extends State<PermissionsDialog> {
  late Permissions _permissions;

  @override
  void initState() {
    super.initState();
    _permissions = widget.member.permissions;
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    return AlertDialog(
      title: const Text('Permissions'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SwitchListTile(
              title: const Text('View All Locations'),
              value: _permissions.viewAllLocations,
              onChanged: (value) => setState(() {
                _permissions = Permissions(
                  viewAllLocations: value,
                  mapAccess: _permissions.mapAccess,
                  receiveSOSAlerts: _permissions.receiveSOSAlerts,
                  receiveGeofenceAlerts: _permissions.receiveGeofenceAlerts,
                  receiveBatteryAlerts: _permissions.receiveBatteryAlerts,
                  trackingEnabled: _permissions.trackingEnabled,
                );
              }),
            ),
            SwitchListTile(
              title: const Text('Map Access'),
              value: _permissions.mapAccess,
              onChanged: (value) => setState(() {
                _permissions = Permissions(
                  viewAllLocations: _permissions.viewAllLocations,
                  mapAccess: value,
                  receiveSOSAlerts: _permissions.receiveSOSAlerts,
                  receiveGeofenceAlerts: _permissions.receiveGeofenceAlerts,
                  receiveBatteryAlerts: _permissions.receiveBatteryAlerts,
                  trackingEnabled: _permissions.trackingEnabled,
                );
              }),
            ),
            SwitchListTile(
              title: const Text('Tracking Enabled'),
              value: _permissions.trackingEnabled,
              onChanged: (value) => setState(() {
                _permissions = Permissions(
                  viewAllLocations: _permissions.viewAllLocations,
                  mapAccess: _permissions.mapAccess,
                  receiveSOSAlerts: _permissions.receiveSOSAlerts,
                  receiveGeofenceAlerts: _permissions.receiveGeofenceAlerts,
                  receiveBatteryAlerts: _permissions.receiveBatteryAlerts,
                  trackingEnabled: value,
                );
              }),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: () async {
            try {
              await auth.apiService!.updateMemberPermissions(
                auth.user!.groupId!,
                widget.member.id,
                _permissions,
              );
              if (mounted) Navigator.pop(context);
            } catch (e) {
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Error: $e')),
                );
              }
            }
          },
          child: const Text('Save'),
        ),
      ],
    );
  }
}
