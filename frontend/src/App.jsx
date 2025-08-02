import React, { useState } from "react";
import UserForm from "../src/components/UserForm";
import PollutionInfo from "../src/components/PollutionInfo";
import WaterInfo from "../src/components/WaterInfo"; 
import SoilInfo from "../src/components/SoilInfo";    
import Report from "../src/pages/Report";

const Home = () => {
  const [user, setUser] = useState(null);

  return (
    <div className="min-h-screen p-4">
      <UserForm onUserSaved={setUser} />
      <PollutionInfo user={user} />
      <WaterInfo user={user} />
      <SoilInfo user={user} />
      <Report user={user} />
    </div>
  );
};

export default Home;
