// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Profile.css";

const Profile = ({ user }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    fullName: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    city: "",   // 🔹 replaced healthInfo with city
    email: user?.email || "",
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true); // start in edit mode for new users

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData({ ...profileData, ...docSnap.data() });
          setIsEditing(false); // switch to view mode if profile exists
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line
  }, [user]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, profileData, { merge: true });
      alert("Profile saved successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile. Check console.");
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Header />

      <main className="profile-container">
        <h2>Welcome, {user.displayName || user.email}</h2>

        {isEditing ? (
          <div className="profile-form">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={profileData.fullName}
              onChange={handleChange}
            />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={profileData.age}
              onChange={handleChange}
            />
            <select
              name="gender"
              value={profileData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={profileData.phone}
              onChange={handleChange}
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={profileData.address}
              onChange={handleChange}
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={profileData.city}
              onChange={handleChange}
            />
            <input type="email" value={profileData.email} readOnly />
            <button onClick={handleSave}>Save Profile</button>
          </div>
        ) : (
          <div className="profile-details">
            <p><strong>Full Name:</strong> {profileData.fullName}</p>
            <p><strong>Age:</strong> {profileData.age}</p>
            <p><strong>Gender:</strong> {profileData.gender}</p>
            <p><strong>Phone:</strong> {profileData.phone}</p>
            <p><strong>Address:</strong> {profileData.address}</p>
            <p><strong>City:</strong> {profileData.city}</p>
            <p><strong>Email:</strong> {profileData.email}</p>
            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
          </div>
        )}

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </main>

      <Footer />
    </>
  );
};

export default Profile;
