import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Terms from "./pages/Terms";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </Router>
  );
};

export default App;
