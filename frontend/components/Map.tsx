"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Item } from "@/lib/types";

// Note: We removed the import "leaflet/dist/leaflet.css" here because we added it to layout.tsx

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13);
  }, [lat, lng, map]);
  return null;
}

export default function Map({ items }: { items: Item[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div style={{ height: "300px", width: "100%", background: "#e5e7eb" }} className="rounded-2xl animate-pulse" />;
  }

  const defaultCenter: [number, number] = [40.7128, -74.0060];
  const pins = items.filter(i => i.latitude && i.longitude);

  // Calculate center
  const center: [number, number] = pins.length > 0
    ? [pins[0].latitude!, pins[0].longitude!]
    : defaultCenter;

  return (
    // FORCE HEIGHT WITH INLINE STYLE
    <div style={{ height: "300px", width: "100%", position: "relative", zIndex: 0 }} className="rounded-2xl overflow-hidden shadow-inner border border-stone-200">
      <MapContainer
        // Key forces React to re-draw the map if the number of pins changes
        key={pins.length}
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter lat={center[0]} lng={center[1]} />

        {pins.map((item) => (
          <Marker
            key={item.id}
            position={[item.latitude!, item.longitude!]}
            icon={icon}
          >
            <Popup>
              <div className="text-center p-1">
                <strong className="block text-sm">{item.store.name}</strong>
                <span className="text-xs text-gray-500">{item.location_text}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
