import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import "./UserForm.css";

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "12px",
};

const defaultCenter = { lat: 20.5937, lng: 78.9629 }; 

const UserForm = ({ onUserSaved }) => {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male",
    disease: "None",
    city: "",
    latitude: null,
    longitude: null,
  });

  const [error, setError] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API, 
  });

  // Try to detect user's current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoordinates(coords);
          setForm((prev) => ({ ...prev, latitude: coords.lat, longitude: coords.lng }));
        },
        (err) => {
          console.warn("No user location provided:", err.message);
          setCoordinates(defaultCenter);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.warn("Geolocation not supported");
      setCoordinates(defaultCenter);
    }
  }, []);

  // ✅ Now fetchCoordinates is defined
  const fetchCoordinates = async (cityName) => {
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: cityName, format: "json", limit: 1 },
      });

      if (res.data.length > 0) {
        const { lat, lon } = res.data[0];
        const coords = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setCoordinates(coords);
        setForm((prev) => ({ ...prev, latitude: coords.lat, longitude: coords.lng }));

        if (mapRef) {
          mapRef.panTo(coords);
        }
      }
    } catch (err) {
      console.error("Error fetching coordinates:", err);
    }
  };

  const handleChange = (e) => {
    const updatedForm = { ...form, [e.target.name]: e.target.value };
    setForm(updatedForm);


  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const coords = { lat, lng };
    setCoordinates(coords);
    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
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
        {/* Form Section */}
        <div className="form-section">
          <h2 className="user-form-title"> Fill Out Your Profile</h2>
          <p className="instruction-text">
            Please provide accurate information for better environmental impact analysis.
          </p>
          <form onSubmit={handleSubmit} className="user-form">
            <label htmlFor="name">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

            <label htmlFor="age">Age</label>
            <input
              name="age"
              type="number"
              value={form.age}
              onChange={handleChange}
              placeholder="Enter your age"
              required
            />

            <label htmlFor="city">City</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Start typing your city"
              required
            />
       

            <label htmlFor="gender">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <label htmlFor="disease">Existing Disease (if any)</label>
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

        {/* Map Section */}
        {isLoaded && (
          <div className="map-section">
            <h3 className="map-title">📍 Select Your Exact Location</h3>
            <p className="instruction-text">
              You can click anywhere on the map to refine your location. This helps us fetch more accurate pollution data for your report.
            </p>
            <p>
              <strong>Selected Coordinates:</strong>{" "}
              {coordinates
                ? `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`
                : "Fetching current location..."}
            </p>
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
