import React, { useState } from "react";
import UserForm from "./components/UserForm";
import PollutionInfo from "./components/PollutionInfo";
import WaterInfo from "./components/WaterInfo"; 
// import SoilInfo from "./components/SoilInfo";    
import Report from "./pages/Report";
import Footer from "./components/Footer"; 
import Header from "./components/Header";  

const Home = () => {
  const [user, setUser] = useState(null);

  return (
    <div className="app-container">
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="main-content">
        <UserForm onUserSaved={setUser} />
        <Report user={user} />
        <PollutionInfo user={user} />
        <WaterInfo user={user} />
        {/* <SoilInfo user={user} /> */}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
