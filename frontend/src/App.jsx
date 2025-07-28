import React, { useState } from "react";
import UserForm from "../src/components/UserForm";
import PollutionInfo from "../src/components/PollutionInfo";
import Report from "../src/pages/Report";

const Home = () => {
  const [user, setUser] = useState(null);

  return (
    <div className="min-h-screen p-4">
      <UserForm onUserSaved={setUser} />
      <PollutionInfo user={user} />
      <Report user={user} />
    </div>
  );
};

export default Home;
