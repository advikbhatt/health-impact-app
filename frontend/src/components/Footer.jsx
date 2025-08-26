import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Left Section */}
      <div className="footer-left">
        © {new Date().getFullYear()} by{" "}
        <span className="font-semibold">RIG360 MEDIA & NEWS PVT LTD</span>
      </div>

      {/* Center Links */}
      <div className="footer-links">
        <Link to="/terms" className="footer-link">
          Terms of Service
        </Link>
        <Link to="/careers" className="footer-link">
          Careers
        </Link>
      </div>

      {/* Right Social Icons */}
      <div className="footer-icons">
        <a
          href="https://www.facebook.com/rig360media#"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <FaFacebook size={20} />
        </a>
        <a
          href="https://x.com/rig360media"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
        >
          <FaTwitter size={20} />
        </a>
        <a
          href="https://www.instagram.com/rig360media/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <FaInstagram size={20} />
        </a>
        <a
          href="https://www.linkedin.com/company/rig360-media-pvt-ltd"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <FaLinkedin size={20} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
