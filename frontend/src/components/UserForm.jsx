// src/components/UserForm.jsx
import React, { useState } from "react";
import axios from "axios";
import "./UserForm.css"; // 🔥 Import custom CSS

const UserForm = ({ onUserSaved }) => {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male",
    disease: "None",
    city: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, age, city } = form;
    if (!name || !age || !city) return setError("All fields are required.");

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/save_user`, form);
      localStorage.setItem("user", JSON.stringify(form));
      setError("");
      onUserSaved(form); // triggers pollution fetch
    } catch (err) {
      setError("Failed to save user. Try again.");
    }
  };

  return (
    <div className="user-form-container">
      <h2 className="user-form-title">🧍 User Profile</h2>
      <form onSubmit={handleSubmit} className="user-form">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="Age" required />
        <input name="city" value={form.city} onChange={handleChange} placeholder="City" required />

        <select name="gender" value={form.gender} onChange={handleChange}>
          <option>Male</option><option>Female</option><option>Other</option>
        </select>

        <select name="disease" value={form.disease} onChange={handleChange}>
          <option>None</option><option>Asthma</option><option>Heart Disease</option><option>Allergy</option>
          {/* Add more options for desiases later  */}
        </select>

        <button type="submit">Submit</button>
        {error && <p className="user-form-error">{error}</p>}
      </form>
    </div>
  );
};

export default UserForm;
