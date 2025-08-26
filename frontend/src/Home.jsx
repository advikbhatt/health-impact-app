import React, { useState } from "react";
import UserForm from "./components/UserForm";
import PollutionInfo from "./components/PollutionInfo";
import WaterInfo from "./components/WaterInfo"; 
// import SoilInfo from "./components/SoilInfo";    
import Report from "./pages/Report";
import Footer from "./components/Footer"; 
import DetailInfo  from "./components/DetailInfo";

const Home = () => {
  const [user, setUser] = useState(null);

  return (
    <div className="min-h-screen p-4 flex flex-col">
      <DetailInfo/>
      <UserForm onUserSaved={setUser} />
      <Report user={user} />
      <PollutionInfo user={user} />
      <WaterInfo user={user} />
      {/* <SoilInfo user={user} /> */}
      <Footer />
    </div>
  );
};

export default Home;
