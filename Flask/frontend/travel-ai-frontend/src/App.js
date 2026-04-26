import React, { useState } from "react";
import axios from "axios";
import InputForm from "./components/InputForm";
import MapView from "./components/MapView";
import "./App.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function App() {
  const [formData, setFormData] = useState({
    Likes_Beach: 0,
    Likes_Mountain: 0,
    Likes_Culture: 0,
    Likes_Adventure: 0,
    Budget: 2,
    Total_Days: 3,
  });

  const [mainClusters, setMainClusters] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState({});
  const [limit, setLimit] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ combine all clusters
  const allClusters = [
    ...mainClusters,
    ...suggestions.filter(
      (s) => !mainClusters.find((m) => m.cluster === s.cluster)
    ),
  ];

  // ✅ Toggle cluster
  const toggleCluster = (cluster) => {
    const exists = selectedClusters.some(
      (c) => c.cluster === cluster.cluster
    );

    if (exists) {
      setSelectedClusters((prev) =>
        prev.filter((c) => c.cluster !== cluster.cluster)
      );

      // remove places too
      setSelectedPlaces((prev) => {
        const updated = { ...prev };
        delete updated[cluster.cluster];
        return updated;
      });
    } else {
      if (selectedClusters.length < limit) {
        setSelectedClusters((prev) => [...prev, cluster]);
      } else {
        alert(`You can only select ${limit} clusters`);
      }
    }
  };

  // ✅ Toggle places (max 3 per cluster)
  const togglePlace = (clusterName, place) => {
    const currentPlaces = selectedPlaces[clusterName] || [];

    const exists = currentPlaces.some(
      (p) => p.place === place.place
    );

    if (exists) {
      setSelectedPlaces((prev) => ({
        ...prev,
        [clusterName]: currentPlaces.filter(
          (p) => p.place !== place.place
        ),
      }));
    } else {
      if (currentPlaces.length < 3) {
        setSelectedPlaces((prev) => ({
          ...prev,
          [clusterName]: [...currentPlaces, place],
        }));
      } else {
        alert("You can only select 3 places per cluster");
      }
    }
  };

  // ✅ API call
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    setMainClusters([]);
    setSuggestions([]);
    setSelectedClusters([]);
    setSelectedPlaces({});

    try {
      const response = await axios.post(
        "http://localhost:3000/recommend",
        formData
      );

      if (response.data.success) {
        const data = response.data.data;

        setMainClusters(data.main);
        setSuggestions(data.suggestions);
        setSelectedClusters(data.main);
        setLimit(data.limit);
      } else {
        setError("Failed to get recommendations");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <h1>🌍 AI Travel Planner</h1>

      <InputForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {/* ✅ Cluster Selection */}
      <div style={{ marginTop: "30px" }}>
        <h2>
          📍 Choose Destinations ({selectedClusters.length}/{limit})
        </h2>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {allClusters.map((c, index) => {
            const isSelected = selectedClusters.some(
              (s) => s.cluster === c.cluster
            );

            return (
              <div
                key={index}
                onClick={() => toggleCluster(c)}
                style={{
                  padding: "10px 15px",
                  background: isSelected ? "#4CAF50" : "#ddd",
                  color: isSelected ? "white" : "black",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                {c.cluster}
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ Place Selection */}
      <div style={{ marginTop: "30px" }}>
        {selectedClusters.map((cluster, idx) => (
          <div key={idx} style={{ marginBottom: "25px" }}>
            <h3>
              📌 {cluster.cluster} (
              {(selectedPlaces[cluster.cluster] || []).length}/3 Places)
            </h3>

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {cluster.places?.map((place, pIndex) => {
                const isSelected =
                  selectedPlaces[cluster.cluster]?.some(
                    (p) => p.place === place.place
                  );

                return (
                  <div
                    key={pIndex}
                    onClick={() =>
                      togglePlace(cluster.cluster, place)
                    }
                    style={{
                      padding: "8px 12px",
                      background: isSelected
                        ? "#2196F3"
                        : "#eee",
                      color: isSelected
                        ? "white"
                        : "black",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    {place.place}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Map */}
      <MapView
        clusters={selectedClusters}
        selectedPlaces={selectedPlaces}
      />
    </div>
  );
}

export default App;