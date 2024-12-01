import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css"; // Importing CSS file for styling

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
          <li>
            <a href="#why-choose">Why SmartHire</a>
          </li>
          <li>
            <a href="#services">Services</a>
          </li>
          <li>
            <a href="#contact">Sign In</a>
          </li>
        </ul>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1>Welcome to SmartHire</h1>
          <p>Revolutionizing recruitment with smarter solutions.</p>
          <button
            className="cta-button"
            onClick={() => navigate("/candidate-signup")}
          >
            Get Started
          </button>
        </div>
        <div className="hero-image">
          <img
            src="https://th.bing.com/th/id/R.b49e2428e02ccbb0e2a8f4b271f93256?rik=hWdasGKboibaoQ&riu=http%3a%2f%2fhrmasia.com%2fwp-content%2fuploads%2f2019%2f08%2f38150942_m.jpg&ehk=AazFSnXe8s0CPROuVSpm51z%2b2m1yku0rXyK7mkKp7SE%3d&risl=&pid=ImgRaw&r=0/900x400" // Replace with a suitable image URL
            alt="Hero"
          />
        </div>
      </header>

      {/* Why Choose SmartHire Section */}
      <section className="why-choose" id="why-choose">
        <h2 className="animated-text">{chooseText}</h2>
        <p>
          SmartHire ensures you get the best candidates for your job openings
          through seamless AI-powered hiring.
        </p>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature">
          <h3>Automated Screening</h3>
          <p>Leverage AI to analyze resumes efficiently.</p>
        </div>
        <div className="feature">
          <h3>Candidate Ranking</h3>
          <p>Find the most qualified candidates in no time.</p>
        </div>
        <div className="feature">
          <h3>Data Insights</h3>
          <p>Get actionable insights for informed decisions.</p>
        </div>
      </section>

      {/* Signup Section */}
      <section className="signup-container">
        <div className="signup-part candidate">
          <h3>Candidate Signup</h3>
          <p>
            Ready to embark on your career journey? Join us to find the best
            opportunities tailored for you.
          </p>
          <button onClick={() => navigate("/candidate-signup")}>
            Signup as Candidate
          </button>
        </div>
        <div className="signup-part hr">
          <h3>HR Signup</h3>
          <p>
            Looking for top talent? Post job openings and access the best
            candidates seamlessly.
          </p>
          <button onClick={() => navigate("/hr-signup")}>Signup as HR</button>
        </div>
      </section>

      {/* Start Now Section */}
      <section className="start-now">
        <h2>Start Now</h2>
        <div className="start-now-buttons">
          <button onClick={() => navigate("/candidate-signin")}>
            Candidate Signin
          </button>
          <button onClick={() => navigate("/hr-signin")}>HR Signin</button>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-section" id="services">
          <h3>Our Services</h3>
          <p>AI-Powered Candidate Evaluation, Resume Screening, and more.</p>
        </div>
        <div className="footer-section" id="contact">
          <h3>Contact Us</h3>
          <p>Email: support@smarthire.com | Phone: 1800-123-456</p>
        </div>
        <div className="footer-copy">
          <p>&copy; 2024 SmartHire. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
