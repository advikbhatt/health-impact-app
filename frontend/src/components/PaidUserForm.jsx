import React, { useState } from "react";
import axios from "axios";

const PaidUserForm = ({ onPaidUserSaved }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    city: "",
    disease: "",
    lifestyle: "",
    medical_history: "",
    smoking: false,
    exercise: "",
    diet: "",
    stress_level: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/save_paid_user`, formData);
      setMsg("✅ Paid user data saved successfully!");
      onPaidUserSaved(formData);
    } catch (err) {
      console.error(err);
      setMsg("⚠️ Failed to save paid user data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paid-user-form">
      <h2>Premium Health Profile</h2>
      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input name="age" placeholder="Age" type="number" value={formData.age} onChange={handleChange} required />

        <label>Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <input name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
        <input name="disease" placeholder="Existing Disease (if any)" value={formData.disease} onChange={handleChange} />

        {/* Lifestyle */}
        <label>Lifestyle</label>
        <select name="lifestyle" value={formData.lifestyle} onChange={handleChange}>
          <option value="">Select</option>
          <option>Sedentary (little or no exercise)</option>
          <option>Moderately Active</option>
          <option>Active</option>
          <option>Very Active</option>
        </select>

        <label>Medical History</label>
        <select name="medical_history" value={formData.medical_history} onChange={handleChange}>
          <option value="">Select</option>
          <option>None</option>
          <option>Asthma</option>
          <option>Diabetes</option>
          <option>Heart Disease</option>
          <option>Hypertension</option>
          <option>Other</option>
        </select>

        <label>Do you smoke?</label>
        <select name="smoking" value={formData.smoking} onChange={handleChange}>
          <option value="">Select</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
          <option value="occasional">Occasionally</option>
        </select>

        <label>Exercise Routine</label>
        <select name="exercise" value={formData.exercise} onChange={handleChange}>
          <option value="">Select</option>
          <option>None</option>
          <option>1–2 times a week</option>
          <option>3–4 times a week</option>
          <option>Daily</option>
        </select>

        <label>Diet</label>
        <select name="diet" value={formData.diet} onChange={handleChange}>
          <option value="">Select</option>
          <option>Balanced Diet</option>
          <option>High Fat / Junk Food</option>
          <option>Vegetarian</option>
          <option>Vegan</option>
          <option>Non-Vegetarian</option>
        </select>

        <label>Stress Level</label>
        <select name="stress_level" value={formData.stress_level} onChange={handleChange}>
          <option value="">Select</option>
          <option>Low</option>
          <option>Moderate</option>
          <option>High</option>
          <option>Very High</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
};

export default PaidUserForm;