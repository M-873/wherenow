import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import { useMemo } from "react";

export type MemberPin = {
  id: string;
  name: string;
  initials: string;
  lat: number;
  lng: number;
  battery: number;
  lastSeen: string;
  color: string;
};

const makeIcon = (initials: string, color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="
      width:42px;height:42px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      box-shadow:0 6px 20px -4px ${color}aa, 0 0 0 3px rgba(255,255,255,0.15);
      display:grid;place-items:center;border:2px solid rgba(255,255,255,0.25);">
      <span style="transform:rotate(45deg);color:#0a1929;font-weight:700;font-size:13px;font-family:Inter,sans-serif;">${initials}</span>
    </div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 42],
  });

interface Props {
  members: MemberPin[];
  geofences?: { lat: number; lng: number; radius: number; name: string }[];
  route?: [number, number][];
  center?: [number, number];
  zoom?: number;
}

export function FamilyMap({ members, geofences = [], route, center, zoom = 13 }: Props) {
  const initialCenter = useMemo<[number, number]>(
    () => center ?? (members[0] ? [members[0].lat, members[0].lng] : [40.7128, -74.006]),
    [center, members],
  );

  return (
    <MapContainer
      center={initialCenter}
      zoom={zoom}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      {geofences.map((g, i) => (
        <Circle
          key={i}
          center={[g.lat, g.lng]}
          radius={g.radius}
          pathOptions={{ color: "#5cbdb9", fillColor: "#5cbdb9", fillOpacity: 0.12, weight: 1.5, dashArray: "4 6" }}
        />
      ))}
      {route && route.length > 1 && (
        <Polyline positions={route} pathOptions={{ color: "#5cbdb9", weight: 4, opacity: 0.7 }} />
      )}
      {members.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]} icon={makeIcon(m.initials, m.color)}>
          <Popup>
            <div style={{ fontFamily: "Inter, sans-serif", minWidth: 140 }}>
              <strong>{m.name}</strong>
              <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
                🔋 {m.battery}% · {m.lastSeen}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
