import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header>
      <h1>🌍 Health Impact App</h1>
      <nav style={{ marginTop: "10px" }}>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
        <Link to="/report" style={linkStyle}>Report</Link>
      </nav>
    </header>
  );
}

const linkStyle = {
  color: "white",
  marginRight: "20px",
  textDecoration: "none",
  fontWeight: "bold",
};

export default Header;
