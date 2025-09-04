import React from "react";
import { 
  FaVideo, 
  FaFilm, 
  FaEdit, 
  FaMicrophone, 
  FaProjectDiagram, 
  FaRegLightbulb, 
  FaBookOpen, 
  FaUsers, 
  FaChartBar, 
  FaGlobe 
} from "react-icons/fa";
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
            <h1>About Us</h1>
            <p>
              We are an editorial-based video production company proudly collaborating 
              with <strong>ChildSafe Environs</strong>. Our expertise lies in producing 
              impactful visual stories that raise awareness on child safety, health, and 
              environmental protection. From concept to final cut, we deliver high-quality 
              content that educates, informs, and inspires communities.
            </p>
            <h2>Our Mission</h2>
            <p>
              To support ChildSafe Environs in building safer and healthier environments 
              for children and families through the power of video. We combine creativity, 
              storytelling, and technology to amplify messages of awareness, prevention, 
              and community action.
            </p>
          </div>
        </section>
     
        {/* Services Section */}
        <section className="services-section">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            {/* Video Production Services */}
            <div className="card">
              <FaVideo className="card-icon" />
              <h3>Awareness & Promotional Videos</h3>
              <p>Engaging videos that spread awareness about child safety and environmental health.</p>
            </div>
            {/* <div className="card">
              <FaFilm className="card-icon" />
              <h3>Documentaries</h3>
              <p>Impact-driven films highlighting pollution, health, and safer communities.</p>
            </div> */}
            <div className="card">
              <FaEdit className="card-icon" />
              <h3>Educational Content</h3>
              <p>Video lessons and resources tailored for schools, NGOs, and families.</p>
            </div>
            <div className="card">
              <FaMicrophone className="card-icon" />
              <h3>Voiceover & Sound Design</h3>
              <p>Professional narration and soundscapes that enhance impactful storytelling.</p>
            </div>
            <div className="card">
              <FaProjectDiagram className="card-icon" />
              <h3>Event Coverage</h3>
              <p>Documenting seminars, awareness drives, and community programs with multi-camera setups.</p>
            </div>
            {/* <div className="card">
              <FaRegLightbulb className="card-icon" />
              <h3>Creative Concept Development</h3>
              <p>End-to-end content development – from scriptwriting to final delivery – focused on safety and awareness.</p>
            </div> */}

            {/* Website Features */}
            <div className="card">
              <FaBookOpen className="card-icon" />
              <h3>Knowledge Hub</h3>
              <p>Access articles, guides, and resources on child safety and environmental health.</p>
            </div>
            <div className="card">
              <FaUsers className="card-icon" />
              <h3>Community Support</h3>
              <p>Join parents, educators, and experts to share ideas and best practices.</p>
            </div>
            <div className="card">
              <FaChartBar className="card-icon" />
              <h3>Reports & Insights</h3>
              <p>Stay updated with the latest reports, data, and visual insights on safety.</p>
            </div>
            <div className="card">
              <FaGlobe className="card-icon" />
              <h3>Global Awareness Campaigns</h3>
              <p>Be part of worldwide initiatives promoting safe and healthy environments.</p>
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
