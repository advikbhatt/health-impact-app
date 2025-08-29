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
              <h3>🏢 Company</h3>
              <p>RIG 360 Media & News Pvt. Ltd.</p>
            </div>
            {/* <div className="info-card">
              <h3>🆔 GST</h3>
              <p>07AAICR2817H1ZC</p>
            </div> */}
            <div className="info-card">
              <h3>📍 Address</h3>
              <p>Sector-A/Pocket-A, 1022, Vasant Kunj, New Delhi-110070</p>
            </div>
            <div className="info-card">
              <h3>📧 Email</h3>
              <p>Rig360media@gmail.com</p>
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
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3505.7573063571895!2d77.16024821093374!3d28.516948675626914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1e704d381053%3A0x5ff27038d784859a!2s1022%2C%20Pocket%20A%2C%20Sector-A%2C%20Vasant%20Kunj%2C%20New%20Delhi%2C%20Delhi%20110070!5e0!3m2!1sen!2sin!4v1756461518512!5m2!1sen!2sin"
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
