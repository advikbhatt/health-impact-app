import React from "react";
import { Link } from "react-router-dom";
import { FaWind, FaTint, FaLeaf, FaVolumeUp, FaHeartbeat, FaChartLine } from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./About.css";

const About = () => {
  return (
    <div className="about-page-wrapper">
      {/* Header */}
      <Header />

      <div className="about-page" style={{ paddingTop: "2rem" }}>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>ChildSafeEnvirons</h1>
            <p>
              Monitor air and water pollution in real-time. 
              Receive health impact forecasts tailored to your profile.
            </p>
            <h2>Our Mission</h2>
            <p>
              We are dedicated to creating safer environments for families and communities. 
              By providing accurate pollution data, risk forecasts, and actionable guidance, 
              we empower you to take preventive measures.
            </p>
          </div>
        </section>
     
        {/* Services Section */}
        <section className="services-section">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            <div className="card">
              <FaWind className="card-icon" />
              <h3>Air Pollution Monitoring</h3>
              <p>Track air quality and pollutant levels in real-time.</p>
            </div>
            <div className="card">
              <FaTint className="card-icon" />
              <h3>Water Quality Analysis</h3>
              <p>Monitor water sources and detect contamination early.</p>
            </div>
            {/* <div className="card">
              <FaLeaf className="card-icon" />
              <h3>Land Pollution Tracking</h3>
              <p>Assess soil health and environmental hazards on land.</p>
            </div> */}
            {/* <div className="card">
              <FaVolumeUp className="card-icon" />
              <h3>Noise & Sound Monitoring</h3>
              <p>Analyze sound pollution to prevent health risks.</p>
            </div> */}
            <div className="card">
              <FaHeartbeat className="card-icon" />
              <h3>Personalized Health Forecasts</h3>
              <p>Get insights based on your exposure, age, and lifestyle.</p>
            </div>
            <div className="card">
              <FaChartLine className="card-icon" />
              <h3>Interactive Reports</h3>
              <p>Visualizations and easy-to-read summaries for informed decisions.</p>
            </div>
          </div>
        </section>


      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
