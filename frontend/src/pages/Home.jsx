import React, { useState } from "react";
import UserForm from "../components/UserForm";
import PollutionInfo from "../components/PollutionInfo";
import Report from "../components/Report";

const Home = () => {
  const [user, setUser] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 p-4">
      <UserForm onUserSaved={setUser} />
      <PollutionInfo user={user} />
      <Report user={user} />
    </div>
  );
};

export default Home;
