import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { db, auth } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
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
    address: "",
    email: "",
    phone: "",
    gender: "Male",
    disease: "None",
    city: "",
    latitude: null,
    longitude: null,
  });

  const [userId, setUserId] = useState(null); // Firebase UID
  const [error, setError] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API,
  });

  // ✅ Listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);

        // Fetch saved profile if exists
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setForm(snap.data());
          setCoordinates({
            lat: snap.data().latitude || defaultCenter.lat,
            lng: snap.data().longitude || defaultCenter.lng,
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Detect current location
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
        () => setCoordinates(defaultCenter),
        { enableHighAccuracy: true }
      );
    } else {
      setCoordinates(defaultCenter);
    }
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle map click
  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setCoordinates({ lat, lng });
    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  // Save to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, age, city, address, email, phone } = form;

    if (!name || !age || !city || !address || !email || !phone) {
      setError("⚠️ Name, Age, City, Address, Email & Phone are required.");
      return;
    }

    try {
      if (!userId) {
        setError("⚠️ Please log in before saving your profile.");
        return;
      }

      const docRef = doc(db, "users", userId);
      await setDoc(docRef, form, { merge: true }); // merge keeps old fields
      setError("");
      onUserSaved(form);
    } catch (err) {
      setError("❌ Failed to save user to Firestore.");
    }
  };

  return (
    <div className="user-form-wrapper">
      <div className="form-map-container">
        <div className="form-section">
          <h2 className="user-form-title"> Fill Out Your Profile</h2>
          <form onSubmit={handleSubmit} className="user-form">
            <label>Full Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required />

            <label>Age *</label>
            <input name="age" type="number" value={form.age} onChange={handleChange} required />

            <label>Address *</label>
            <textarea name="address" value={form.address} onChange={handleChange} required />

            <label>Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />

            <label>Phone *</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />

            <label>City *</label>
            <input name="city" value={form.city} onChange={handleChange} required />

            <label>Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <label>Disease</label>
            <select name="disease" value={form.disease} onChange={handleChange}>
              <option>None</option>
              <option>Asthma</option>
              <option>Heart Disease</option>
              <option>Allergy</option>
            </select>

            <button type="submit">Save Profile</button>
            {error && <p className="user-form-error">{error}</p>}
          </form>
        </div>

        {isLoaded && (
          <div className="map-section">
            <h3 className="map-title">📍 Select Your Exact Location</h3>
            <p>
              <strong>Selected Coordinates:</strong>{" "}
              {coordinates ? `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}` : "Fetching..."}
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
