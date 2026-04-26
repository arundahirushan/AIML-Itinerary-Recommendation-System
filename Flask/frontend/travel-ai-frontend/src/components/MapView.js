import React from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

// ✅ Marker imports
import blueIconUrl from "leaflet-color-markers/img/marker-icon-blue.png";
import redIconUrl from "leaflet-color-markers/img/marker-icon-red.png";
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

// ✅ Airport icon (Red)
const airportIcon = createIcon(redIconUrl);

// ✅ Cluster icon (Red)
const clusterIcon = createIcon(redIconUrl);

// ✅ Place icon (Blue)
const placeIcon = createIcon(blueIconUrl);

// ✅ Distance function
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// ✅ Order route from airport to nearest clusters
function orderClusters(clusters) {
  const start = { lat: 7.18, lon: 79.88 }; // Airport

  const remaining = [...clusters];
  const ordered = [];

  let current = start;

  while (remaining.length > 0) {
    let closestIndex = 0;
    let minDist = Infinity;

    remaining.forEach((c, index) => {
      const dist = getDistance(
        current.lat,
        current.lon,
        c.lat,
        c.lon
      );

      if (dist < minDist) {
        minDist = dist;
        closestIndex = index;
      }
    });

    const next = remaining.splice(
      closestIndex,
      1
    )[0];

    ordered.push(next);
    current = next;
  }

  return ordered;
}

function MapView({
  clusters,
  selectedPlaces,
}) {
  if (!clusters || clusters.length === 0)
    return null;

  // ✅ Airport
  const airport = [7.18, 79.88];

  // ✅ Ordered cluster route
  const orderedClusters =
    orderClusters(clusters);

  // ✅ Route positions
  const positions = [
    airport,
    ...orderedClusters.map((c) => [
      c.lat,
      c.lon,
    ]),
  ];

  // ✅ Map center
  const center = airport;

  // ✅ Flatten selected places
  const allSelectedPlaces =
    Object.entries(
      selectedPlaces || {}
    ).flatMap(
      ([clusterName, places]) =>
        places.map((place) => ({
          ...place,
          clusterName,
        }))
    );

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>🗺️ Travel Map</h2>

      <MapContainer
        center={center}
        zoom={7}
        style={{
          height: "500px",
          borderRadius: "15px",
        }}
      >
        {/* 🌍 Base Map */}
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ✈️ Airport Marker */}
        <Marker
          position={airport}
          icon={airportIcon}
        >
          <Popup>
            <strong>
              ✈️ Start: Airport
            </strong>
            <br />
            Stop #0
          </Popup>
        </Marker>

        {/* 📍 Cluster Markers (Red) */}
        {orderedClusters.map(
          (c, index) => (
            <Marker
              key={`cluster-${index}`}
              position={[
                c.lat,
                c.lon,
              ]}
              icon={clusterIcon}
            >
              <Popup>
                <strong>
                  Cluster Stop #
                  {index + 1}
                </strong>
                <br />
                {c.cluster}
                <br />
                Score:{" "}
                {c.score.toFixed(1)}
              </Popup>
            </Marker>
          )
        )}

        {/* 🏝️ Selected Place Markers (Blue) */}
        {allSelectedPlaces.map(
          (place, index) => (
            <Marker
              key={`place-${index}`}
              position={[
                place.lat,
                place.lon,
              ]}
              icon={placeIcon}
            >
              <Popup>
                <strong>
                  {place.place}
                </strong>
                <br />
                📍 Cluster:{" "}
                {place.clusterName}
                <br />
                🏙️ City:{" "}
                {place.city}
                <br />
                ⭐ Rating:{" "}
                {place.rating}
                <br />
                🏷️ Category:{" "}
                {place.category}
              </Popup>
            </Marker>
          )
        )}

        {/* 🔵 Cluster Route */}
        <Polyline
          positions={positions}
          color="blue"
        />
      </MapContainer>
    </div>
  );
}

export default MapView;