import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaInfoCircle, FaDollarSign, FaEnvelope, FaMoneyBill } from "react-icons/fa";
import "./Header.css";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
            ChildSafeEnvirons
          </Link>
        </div>

        {/* Desktop Menu */}
        <nav className="nav-menu">
          <Link to="/premium" className="nav-item">
            <FaMoneyBill style={{ marginRight: "0.3rem" }} />
            Premium
          </Link>
          <Link to="/about" className="nav-item">
            <FaInfoCircle style={{ marginRight: "0.3rem" }} />
            About Us
          </Link>
          <Link to="/pricing" className="nav-item">
            <FaDollarSign style={{ marginRight: "0.3rem" }} />
            Pricing
          </Link>
          <Link to="/contact" className="nav-item">
            <FaEnvelope style={{ marginRight: "0.3rem" }} />
            Contact Us
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button className="mobile-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu">
          <Link to="/about" className="mobile-item" onClick={() => setIsOpen(false)}>
            <FaInfoCircle style={{ marginRight: "0.5rem" }} />
            About Us
          </Link>
          <Link to="/pricing" className="mobile-item" onClick={() => setIsOpen(false)}>
            <FaDollarSign style={{ marginRight: "0.5rem" }} />
            Pricing
          </Link>
          <Link to="/contact" className="mobile-item" onClick={() => setIsOpen(false)}>
            <FaEnvelope style={{ marginRight: "0.5rem" }} />
            Contact Us
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
