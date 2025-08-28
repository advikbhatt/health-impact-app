import React from "react";
import "./Pricing.css";

const Pricing = () => {
  return (
    <div className="pricing-container">
      <h1 className="pricing-title">Pricing</h1>
      <p className="pricing-subtitle">
        Simple, affordable, and transparent. Choose the plan that’s right for you.
      </p>

      <div className="pricing-card">
        <h2 className="plan-name">Basic Plan</h2>
        <p className="plan-price">₹85  </p>
        <p className="plan-description">
          Perfect for individuals and small businesses who want access to our core features without breaking the bank.
        </p>

        <ul className="plan-features">
          <li>✔ Full access to essential features</li>
          <li>✔ Regular updates & improvements</li>
          <li>✔ Email support</li>
          <li>✔ Cancel anytime</li>
        </ul>

        <p className="plan-why">
          <strong>Why ₹85?</strong><br />
          We believe in offering professional-grade services at a price that’s accessible to everyone. ₹85 keeps our platform sustainable while ensuring continuous improvements and support for you.
        </p>

        {/* <button className="subscribe-btn">Subscribe Now</button> */}
      </div>
    </div>
  );
};

export default Pricing;
