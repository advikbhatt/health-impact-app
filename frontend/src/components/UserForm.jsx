// src/components/UserForm.jsx
import React, { useState } from "react";
import axios from "axios";

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
      await axios.post("http://localhost:8000/save_user", form);
      localStorage.setItem("user", JSON.stringify(form));
      setError("");
      onUserSaved(form); // triggers pollution fetch
    } catch (err) {
      setError("Failed to save user. Try again.");
    }
  };

  return (
    <div className="p-6 bg-white shadow-xl rounded-xl w-full max-w-lg mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">🧍 User Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name"
          className="w-full border p-2 rounded-lg" required />
        <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="Age"
          className="w-full border p-2 rounded-lg" required />
        <input name="city" value={form.city} onChange={handleChange} placeholder="City"
          className="w-full border p-2 rounded-lg" required />
        <select name="gender" value={form.gender} onChange={handleChange}
          className="w-full border p-2 rounded-lg">
          <option>Male</option><option>Female</option><option>Other</option>
        </select>
        <select name="disease" value={form.disease} onChange={handleChange}
          className="w-full border p-2 rounded-lg">
          <option>None</option><option>Asthma</option><option>Heart Disease</option><option>Allergy</option>
        </select>
        <button type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full">Submit</button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
};

export default UserForm;
