import React, { useState } from "react";
import UserForm from "../components/UserForm";
import PollutionInfo from "../components/PollutionInfo";
import Report from "../components/Report";
import "./Home.css"; // 🔥 import your CSS file

const Home = () => {
  const [user, setUser] = useState(null);

  return (
    <div className="home-container">
      <div className="home-inner">

        {/* Section 1: User Form */}
        <section className="home-section">
          <h2 className="section-title">🌍 User Information</h2>
          <UserForm onUserSaved={setUser} />
        </section>

        {/* Section 2: Pollution Info */}
        <section className="home-section">
          <h2 className="section-title">🌫️ Pollution Data</h2>
          <PollutionInfo user={user} />
        </section>

        {/* Section 3: AI Report */}
        <section className="home-section">
          <h2 className="section-title">🧠 Health AI Report</h2>
          <Report user={user} />
        </section>

      </div>
    </div>
  );
};

export default Home;
