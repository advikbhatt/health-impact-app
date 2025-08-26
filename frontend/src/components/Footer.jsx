import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer>
      {/* Left Section */}
      <div className="footer-left">
        © 2025 by <span>RC360 MEDIA & NEWS PVT LTD</span>
      </div>

      {/* Center Links */}
      <div className="footer-links">
        <a href="/terms">Terms of Service</a>
        <a href="/careers">Careers</a>
      </div>

      {/* Right Social Icons */}
      <div className="footer-icons">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <FaFacebook color="#1877F2" size={20} />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <FaTwitter color="#1DA1F2" size={20} />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <FaInstagram color="#E4405F" size={20} />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
          <FaLinkedin color="#0077B5" size={20} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
