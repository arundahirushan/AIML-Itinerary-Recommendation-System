import React from "react";

function Results({ results, error }) {

  if (error) {
    return (
      <div className="results error">
        <h3>❌ Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="results">
      <h2>🎯 Recommended Destinations</h2>

      <div className="cluster-list">
        {results.map((item, index) => (
          <div key={index} className="cluster-card">
            <div className="rank">#{index + 1}</div>
            <div className="info">
              <h3>{item.cluster}</h3>
              <p>Score: {item.score.toFixed(1)}</p>
              <p>📍 {item.lat.toFixed(4)}, {item.lon.toFixed(4)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Results;