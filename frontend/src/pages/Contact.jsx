import React from "react";
import "./Contact.css";
import Header from "../components/Header";  // adjust path if needed
import Footer from "../components/Footer";  // adjust path if needed

const Contact = () => {
  return (
    <>
      <Header />

      <div className="contact-page">
        {/* Hero / Heading */}
        <div className="contact-hero">
          <h1>Contact Us</h1>
          <p>
            We’d love to hear from you! Whether you have a question, feedback, or
            just want to say hello, feel free to reach out.
          </p>
        </div>

        <div className="contact-content">
          {/* Contact Info Section */}
          <div className="contact-info">
            <div className="info-card">
              <h3>📍 Address</h3>
              <p>123 Business Street, Tech City, India</p>
            </div>
            <div className="info-card">
              <h3>📞 Phone</h3>
              <p>+91 98765 43210</p>
            </div>
            <div className="info-card">
              <h3>📧 Email</h3>
              <p>support@yourapp.com</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form">
            <h2>Send us a Message</h2>
            <form>
              <div className="form-group">
                <label>Name</label>
                <input type="text" placeholder="Your Name" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="Your Email" required />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea placeholder="Your Message" rows="5" required></textarea>
              </div>
              <button type="submit" className="send-btn">
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="map-container">
          <iframe
            title="location-map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.093754470829!2d-122.41941558468122!3d37.77492977975914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085808f0f6b6a13%3A0x4e36d33eeb7d7f7!2sSan%20Francisco!5e0!3m2!1sen!2sin!4v1692441234567"
            width="100%"
            height="300"
            style={{ border: "0" }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Contact;
