import React, { useState } from "react";
import UserForm from "./components/UserForm";
import PollutionInfo from "./components/PollutionInfo";
import WaterInfo from "./components/WaterInfo"; 
import Report from "./pages/Report";
import PaidUserForm from "./components/PaidUserForm";
import PaidReport from "./pages/PaidReport";
import Footer from "./components/Footer"; 
import Header from "./components/Header";  

const Home = () => {
  const [user, setUser] = useState(null);
  const [paidUser, setPaidUser] = useState(null);

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {/* Free Section */}
        <UserForm onUserSaved={setUser} />
        <Report user={user} />
        <PollutionInfo user={user} />
        <WaterInfo user={user} />

        {/* Premium Section */}
        <PaidUserForm onPaidUserSaved={setPaidUser} />
        <PaidReport paidUser={paidUser} />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
