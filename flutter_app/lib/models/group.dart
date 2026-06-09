class Group {
  final String id;
  final String name;
  final String hostId;
  final String inviteCode;
  final List<String> members;

  Group({
    required this.id,
    required this.name,
    required this.hostId,
    required this.inviteCode,
    required this.members,
  });

  factory Group.fromJson(Map<String, dynamic> json) {
    return Group(
      id: json['_id'],
      name: json['name'],
      hostId: json['hostId'],
      inviteCode: json['inviteCode'],
      members: List<String>.from(json['members']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'hostId': hostId,
      'inviteCode': inviteCode,
      'members': members,
    };
  }
}
