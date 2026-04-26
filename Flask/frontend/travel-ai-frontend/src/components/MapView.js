import React from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline
} from "react-leaflet";

// ✅ Colored marker imports
import blueIconUrl from "leaflet-color-markers/img/marker-icon-blue.png";
import redIconUrl from "leaflet-color-markers/img/marker-icon-red.png";
import greenIconUrl from "leaflet-color-markers/img/marker-icon-green.png";
import orangeIconUrl from "leaflet-color-markers/img/marker-icon-orange.png";
import yellowIconUrl from "leaflet-color-markers/img/marker-icon-yellow.png";
import violetIconUrl from "leaflet-color-markers/img/marker-icon-violet.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// ✅ Create custom icon
const createIcon = (iconUrl) =>
  new L.Icon({
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

// ✅ Airport icon
const airportIcon = createIcon(redIconUrl);

// ✅ Different colors for trip stops
const markerIcons = [
  createIcon(blueIconUrl),
  createIcon(greenIconUrl),
  createIcon(orangeIconUrl),
  createIcon(yellowIconUrl),
  createIcon(violetIconUrl),
];

// ✅ Distance function
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ✅ Order route from airport to nearest destinations
function orderClusters(clusters) {
  const start = { lat: 7.18, lon: 79.88 }; // Airport

  const remaining = [...clusters];
  const ordered = [];

  let current = start;

  while (remaining.length > 0) {
    let closestIndex = 0;
    let minDist = Infinity;

    remaining.forEach((c, index) => {
      const dist = getDistance(current.lat, current.lon, c.lat, c.lon);

      if (dist < minDist) {
        minDist = dist;
        closestIndex = index;
      }
    });

    const next = remaining.splice(closestIndex, 1)[0];
    ordered.push(next);
    current = next;
  }

  return ordered;
}

function MapView({ clusters }) {
  if (!clusters || clusters.length === 0) return null;

  // ✅ Airport
  const airport = [7.18, 79.88];

  // ✅ Ordered stops
  const orderedClusters = orderClusters(clusters);

  // ✅ Route positions (airport + all stops)
  const positions = [
    airport,
    ...orderedClusters.map((c) => [c.lat, c.lon]),
  ];

  // ✅ Map centered on airport
  const center = airport;

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>🗺️ Travel Map</h2>

      <MapContainer
        center={center}
        zoom={7}
        style={{ height: "400px", borderRadius: "15px" }}
      >
        {/* 🌍 Base Map */}
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ✈️ Airport Marker */}
        <Marker position={airport} icon={airportIcon}>
          <Popup>
            <strong>✈️ Start: Airport</strong>
            <br />
            Stop #0
          </Popup>
        </Marker>

        {/* 📍 Destination Markers */}
        {orderedClusters.map((c, index) => (
          <Marker
            key={index}
            position={[c.lat, c.lon]}
            icon={markerIcons[index % markerIcons.length]}
          >
            <Popup>
              <strong>Stop #{index + 1}</strong>
              <br />
              {c.cluster}
              <br />
              Score: {c.score.toFixed(1)}
            </Popup>
          </Marker>
        ))}

        {/* 🔵 Route Line */}
        <Polyline positions={positions} color="blue" />
      </MapContainer>
    </div>
  );
}

export default MapView;