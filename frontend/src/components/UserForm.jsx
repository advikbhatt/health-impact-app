import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import "./UserForm.css";

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "12px",
};

const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Center of India

const UserForm = ({ onUserSaved }) => {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male",
    disease: "None",
    city: "",
  });

  const [error, setError] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API,
  });

  const handleChange = (e) => {
    const updatedForm = { ...form, [e.target.name]: e.target.value };
    setForm(updatedForm);

    if (e.target.name === "city" && e.target.value.length > 2) {
      fetchCoordinates(updatedForm.city);
    }
  };

  const fetchCoordinates = async (cityName) => {
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: cityName, format: "json", limit: 1 },
      });

      if (res.data.length > 0) {
        const { lat, lon } = res.data[0];
        const coords = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setCoordinates(coords);

        // Move map center
        if (mapRef) {
          mapRef.panTo(coords);
        }
      }
    } catch (err) {
      console.error("Error fetching coordinates:", err);
    }
  };

  const fetchCityFromCoordinates = async ({ lat, lng }) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            latlng: `${lat},${lng}`,
            key: import.meta.env.VITE_GOOGLE_MAPS_API,
          },
        }
      );

      if (response.data.results.length > 0) {
        const components = response.data.results[0].address_components;
        const cityComp = components.find((c) => c.types.includes("locality"));
        const city = cityComp ? cityComp.long_name : "Unknown";
        setForm((prev) => ({ ...prev, city }));
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    }
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const coords = { lat, lng };
    setCoordinates(coords);
    fetchCityFromCoordinates(coords);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, age, city } = form;
    if (!name || !age || !city) {
      setError("All fields are required.");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/save_user`, form);
      localStorage.setItem("user", JSON.stringify(form));
      setError("");
      onUserSaved(form);
    } catch (err) {
      setError("Failed to save user. Try again.");
    }
  };

  return (
    <div className="user-form-wrapper">
      <div className="form-map-container">
        {/* Form */}
        <div className="form-section">
          <h2 className="user-form-title">🧍 User Profile</h2>
          <form onSubmit={handleSubmit} className="user-form">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
            <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="Age" required />
            <input name="city" value={form.city} onChange={handleChange} placeholder="City" required />

            <select name="gender" value={form.gender} onChange={handleChange}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <select name="disease" value={form.disease} onChange={handleChange}>
              <option>None</option>
              <option>Asthma</option>
              <option>Heart Disease</option>
              <option>Allergy</option>
            </select>

            <button type="submit">Submit</button>
            {error && <p className="user-form-error">{error}</p>}
          </form>
        </div>

        {/* Map */}
        {isLoaded && (
          <div className="map-section">
            <p><strong>Coordinates:</strong> {coordinates ? `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}` : "Click or search to select"}</p>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={coordinates || defaultCenter}
              zoom={coordinates ? 13 : 5}
              onClick={handleMapClick}
              onLoad={(map) => setMapRef(map)}
            >
              {coordinates && <Marker position={coordinates} />}
            </GoogleMap>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserForm;
