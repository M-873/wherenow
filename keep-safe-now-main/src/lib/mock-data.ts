import type { MemberPin } from "@/components/FamilyMap";

export const MOCK_MEMBERS: MemberPin[] = [
  { id: "1", name: "Emma", initials: "EM", lat: 40.7138, lng: -74.0050, battery: 84, lastSeen: "2 min ago", color: "#5cbdb9" },
  { id: "2", name: "Liam", initials: "LI", lat: 40.7158, lng: -74.0090, battery: 42, lastSeen: "just now", color: "#7ed4a8" },
  { id: "3", name: "Mom", initials: "MO", lat: 40.7118, lng: -74.0010, battery: 67, lastSeen: "5 min ago", color: "#2d8a9e" },
  { id: "4", name: "Grandpa", initials: "GR", lat: 40.7098, lng: -74.0070, battery: 23, lastSeen: "11 min ago", color: "#1a4a6e" },
];

export const MOCK_GEOFENCES = [
  { lat: 40.7128, lng: -74.006, radius: 300, name: "Home" },
  { lat: 40.7158, lng: -74.009, radius: 200, name: "School" },
];

export const MOCK_ROUTE: [number, number][] = [
  [40.7118, -74.0010],
  [40.7125, -74.0025],
  [40.7128, -74.0040],
  [40.7135, -74.0050],
  [40.7138, -74.0050],
];

export const MOCK_ALERTS = [
  { id: "a1", type: "geofence", who: "Emma", text: "Arrived at School", time: "8:14 AM", tone: "safe" as const },
  { id: "a2", type: "battery", who: "Grandpa", text: "Battery low (23%)", time: "8:02 AM", tone: "warn" as const },
  { id: "a3", type: "geofence", who: "Liam", text: "Left Home", time: "7:48 AM", tone: "info" as const },
];
