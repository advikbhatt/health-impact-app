// src/pages/Home.jsx
import React, { useState } from "react";
import UserForm from "../components/UserForm";
import PollutionInfo from "../components/PollutionInfo";
import WaterInfo from "../components/WaterInfo";
import SoilInfo from "../components/SoilInfo";
import Report from "./Report";
import "./Home.css";

const Home = () => {
  const [user, setUser] = useState(null);

  return (
    <div className="home-container">
      <div className="home-inner">
        <div className="home-section">
          <h2 className="section-title">🧍 User Profile</h2>
          <UserForm onUserSaved={setUser} />
        </div>

        <div className="home-section">
          <h2 className="section-title">🌍 Air Quality</h2>
          <PollutionInfo user={user} />
        </div>

        <div className="home-section">
          <h2 className="section-title">💧 Water Quality</h2>
          <WaterInfo user={user} />
        </div>

        <div className="home-section">
          <h2 className="section-title">🪨 Soil Quality</h2>
          <SoilInfo user={user} />
        </div>

        <div className="home-section">
          <h2 className="section-title">📊 Health Report</h2>
          <Report user={user} />
        </div>
      </div>
    </div>
  );
};

export default Home;
