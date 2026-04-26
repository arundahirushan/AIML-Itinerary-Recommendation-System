import React from "react";

function InputForm({ formData, setFormData, onSubmit, loading }) {

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : parseInt(value)
    });
  };

  return (
    <div className="input-form">
      <h2>🌴 Plan Your Trip</h2>

      <div className="preferences">
        <h3>What do you like?</h3>

        <label>
          <input
            type="checkbox"
            name="Likes_Beach"
            checked={formData.Likes_Beach === 1}
            onChange={handleChange}
          />
          🏖️ Beach
        </label>

        <label>
          <input
            type="checkbox"
            name="Likes_Mountain"
            checked={formData.Likes_Mountain === 1}
            onChange={handleChange}
          />
          ⛰️ Mountain
        </label>

        <label>
          <input
            type="checkbox"
            name="Likes_Culture"
            checked={formData.Likes_Culture === 1}
            onChange={handleChange}
          />
          🏛️ Culture
        </label>

        <label>
          <input
            type="checkbox"
            name="Likes_Adventure"
            checked={formData.Likes_Adventure === 1}
            onChange={handleChange}
          />
          🎯 Adventure
        </label>
      </div>

      <div className="options">
        <label>
          💰 Budget:
          <select
            name="Budget"
            value={formData.Budget}
            onChange={handleChange}
          >
            <option value={1}>Low</option>
            <option value={2}>Medium</option>
            <option value={3}>High</option>
          </select>
        </label>

        <label>
          📅 Total Days:
          <input
            type="number"
            name="Total_Days"
            min="1"
            max="10"
            value={formData.Total_Days}
            onChange={handleChange}
          />
        </label>
      </div>

      <button onClick={onSubmit} disabled={loading}>
        {loading ? "Planning..." : "🚀 Plan My Trip"}
      </button>
    </div>
  );
}

export default InputForm;