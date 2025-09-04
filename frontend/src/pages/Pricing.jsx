import React from "react";
import "./Pricing.css";
import Header from "../components/Header";  
import Footer from "../components/Footer";  

const Pricing = () => {
  return (
    <>
      <Header />

      <div className="pricing-container">
        <h1 className="pricing-title">Our Pricing Plans</h1>
        <p className="pricing-subtitle">
          Choose the plan that best suits your needs. 
          Each report provides insights to help families and communities 
          stay safe and informed.
        </p>

        {/* Alignment Section */}
        <div className="pricing-intro">
          <h2>How We Align With ChildSafe Environs</h2>
          <p>
            ChildSafe Environs is focused on empowering communities with the right 
            information to make safer decisions for children and families. 
            As part of our initiative, we provide two affordable report options. 
          </p>
          <p>
            These reports are designed to give families easy-to-understand insights 
            about safety, environment, and health awareness. Whether you need a 
            quick overview or a detailed personalized analysis, we’ve got you covered.
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="pricing-grid">
          {/* Basic Plan */}
          <div className="pricing-card">
            <h2 className="plan-name">Basic Report</h2>
            <p className="plan-price">₹35</p>
            <p className="plan-description">
              A small report designed for quick insights. 
              Ideal for individuals who want a simple overview.
            </p>
            <ul className="plan-features">
              <li>✔ General safety & awareness tips</li>
              <li>✔ Short summary report (1–2 pages)</li>
              <li>✔ Delivered instantly</li>
            </ul>
          </div>

          {/* Premium Plan */}
          <div className="pricing-card premium">
            <h2 className="plan-name">Detailed Report</h2>
            <p className="plan-price">₹85</p>
            <p className="plan-description">
              A detailed, personalized report tailored to your profile. 
              Perfect for families and communities who need deeper insights.
            </p>
            <ul className="plan-features">
              <li>✔ Full safety & environment analysis</li>
              <li>✔ Personalized insights based on user profile</li>
              <li>✔ Actionable recommendations</li>
              <li>✔ Easy-to-read charts & visuals</li>
              <li>✔ Priority support</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Pricing;
