const express = require("express");
const axios = require("axios");
const fs = require("fs");
const csv = require("csv-parser");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

/* ✅ LOAD CLUSTER LOCATIONS (CSV) */
function loadClusterLocations() {
  return new Promise((resolve) => {
    const results = [];

    fs.createReadStream("data/cluster_latitude_longitude.csv")
      .pipe(csv())
      .on("data", (data) => {
        results.push({
          Cluster_Name: data.Location,
          lat: parseFloat(data.Latitude),
          lon: parseFloat(data.Longitude),
        });
      })
      .on("end", () => resolve(results));
  });
}

/* ✅ HAVERSINE DISTANCE FUNCTION */
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

/* ✅ GET REQUIRED CLUSTER COUNT */
function getClusterCount(days) {
  if (days <= 2) return 1;
  if (days <= 4) return 2;
  if (days <= 8) return 3;
  return 4;
}

/* ✅ MAIN CLUSTER SELECTION */
function selectBestClusters(clusters, locations, totalDays) {
  const k = getClusterCount(totalDays);

  const candidates = clusters.slice(0, 10);

  const enriched = candidates.map(c => {
    const loc = locations.find(l => l.Cluster_Name === c.cluster);
    return { ...c, ...loc };
  });

  const selected = [];

  // ✅ pick best first
  selected.push(enriched[0]);

  // ✅ pick closest next clusters
  while (selected.length < k) {
    let bestCandidate = null;
    let bestDistance = Infinity;

    for (let candidate of enriched) {
      if (selected.find(s => s.cluster === candidate.cluster)) continue;

      let minDist = Infinity;

      for (let s of selected) {
        const dist = getDistance(s.lat, s.lon, candidate.lat, candidate.lon);
        if (dist < minDist) minDist = dist;
      }

      if (minDist < bestDistance) {
        bestDistance = minDist;
        bestCandidate = candidate;
      }
    }

    if (bestCandidate) selected.push(bestCandidate);
    else break;
  }

  return selected;
}

/* ✅ GET 2 EXTRA SUGGESTIONS */
function getSuggestions(clusters, locations, selectedClusters) {

  const candidates = clusters.slice(0, 10);

  const enriched = candidates.map(c => {
    const loc = locations.find(l => l.Cluster_Name === c.cluster);
    return { ...c, ...loc };
  });

  // ✅ remove already selected
  const remaining = enriched.filter(c =>
    !selectedClusters.find(s => s.cluster === c.cluster)
  );

  const suggestions = [];

  while (suggestions.length < 2 && remaining.length > 0) {
    let bestCandidate = null;
    let bestDistance = Infinity;

    for (let candidate of remaining) {

      let minDist = Infinity;

      for (let s of selectedClusters) {
        const dist = getDistance(s.lat, s.lon, candidate.lat, candidate.lon);
        if (dist < minDist) minDist = dist;
      }

      if (minDist < bestDistance) {
        bestDistance = minDist;
        bestCandidate = candidate;
      }
    }

    if (bestCandidate) {
      suggestions.push(bestCandidate);

      const index = remaining.findIndex(c => c.cluster === bestCandidate.cluster);
      remaining.splice(index, 1);
    } else {
      break;
    }
  }

  return suggestions;
}

/* ✅ MAIN ROUTE */
app.post("/recommend", async (req, res) => {
  try {
    const userInput = req.body;

    // ✅ call Flask
    const response = await axios.post(
      "http://127.0.0.1:5000/predict",
      userInput
    );

    const clusters = response.data.clusters;

    // ✅ load locations
    const locations = await loadClusterLocations();

    // ✅ main clusters
    const selectedClusters = selectBestClusters(
      clusters,
      locations,
      userInput.Total_Days
    );

    // ✅ suggestions
    const suggestions = getSuggestions(
      clusters,
      locations,
      selectedClusters
    );

    res.json({
      success: true,
      data: {
        main: selectedClusters,
        suggestions: suggestions,
        limit: getClusterCount(userInput.Total_Days)
      }
    });

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      error: "Failed to get recommendations",
    });
  }
});

/* ✅ START SERVER */
app.listen(3000, () => {
  console.log("Node server running on port 3000");
});