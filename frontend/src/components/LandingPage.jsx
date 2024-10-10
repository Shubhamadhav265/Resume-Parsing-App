import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './LandingPage.css'; // Importing CSS file for styling

const LandingPage = () => {
  const [chooseText, setChooseText] = useState("Why SmartHire?");
  const navigate = useNavigate();

  useEffect(() => {
    const texts = [
      "Find the Right Talent Faster.",
      "Automated Resume Screening Powered by AI.",
      "Get Actionable Insights for Informed Decisions.",
    ];

    let index = 0;
    const interval = setInterval(() => {
      setChooseText(texts[index]);
      index = (index + 1) % texts.length;
    }, 4000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="landing-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo">SmartHire</div>
        <ul className="nav-links">
          <li><a href="#why-choose">Why SmartHire</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      {/* Why Choose SmartHire Section */}
      <section className="why-choose" id="why-choose">
        <h2>{chooseText}</h2>
        <p>Our platform ensures you get the best candidate for your job, effortlessly and efficiently.</p>
      </section>

      {/* Candidate and HR Signup Section */}
      <section className="signup-container">
        <div className="signup-part candidate">
          <h3>Candidate Signup</h3>
          <p>Ready to start your career journey? Join us to find the best opportunities suited for you.</p>
          <button onClick={() => navigate('/candidate-signup')}>Signup as Candidate</button>
        </div>
        <div className="signup-part hr">
          <h3>HR Signup</h3>
          <p>Looking for top talent? Post your job openings and access the best candidates quickly.</p>
          <button onClick={() => navigate('/hr-signup')}>Signup as HR</button>
        </div>
      </section>

      {/* Start Now Section with Login Options */}
      <section className="start-now">
        <h2>Start Now</h2>
        <div className="start-now-buttons">
          <button onClick={() => navigate('/candidate-signin')}>Candidate Signin</button>
          <button onClick={() => navigate('/hr-signin')}>HR Signin</button>
        </div>
      </section>

      {/* Hero Section with Swiping Block */}
      <header className="hero-section">
        <div className="hero-content">
          <h1>Welcome to SmartHire</h1>
          <p>Find the right talent, faster and smarter.</p>
        </div>
        <div className="swiping-section">
          <div className="swipe-card">
            <h3>Automated Resume Screening</h3>
            <p>SmartHire leverages AI to quickly analyze resumes, ensuring you get the best candidates for the job.</p>
            <h4>Why Beneficial for Students?</h4>
            <p>Students get personalized recommendations, tailored career paths, and faster access to job opportunities.</p>
          </div>
          <div className="swipe-card">
            <h3>Enhanced Candidate Ranking</h3>
            <p>Our platform ranks candidates based on skills and qualifications, saving you valuable time.</p>
            <h4>Why Beneficial for HR?</h4>
            <p>HR professionals can easily filter, rank, and evaluate candidates based on detailed AI-driven analysis, improving hiring decisions.</p>
          </div>
          <div className="swipe-card">
            <h3>Data-Driven Insights</h3>
            <p>Receive actionable insights on each candidate, ensuring you make informed hiring decisions.</p>
          </div>
        </div>
      </header>

      {/* Footer Sections */}
      <footer>
        <div className="footer-section" id="services">
          <h3>Our Services</h3>
          <p>AI-Powered Candidate Evaluation, Resume Screening, and More.</p>
        </div>
        <div className="footer-section" id="contact">
          <h3>Contact Us</h3>
          <p>Email: support@smarthire.com | Phone: 1800-123-456</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;