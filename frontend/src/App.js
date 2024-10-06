import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import UploadResume from "./UploadResume";
import JobPosting from "./JobPosting";
import CandSignup from "./components/candSignUp"; // Import the existing candidate signup component

const App = () => {
  return (
    <Router>
      <div style={styles.appContainer}>
        <h1 style={styles.title}>Recruitment Portal</h1>
        <nav style={styles.nav}>
          <ul style={styles.navList}>
            <li style={styles.navItem}>
              <Link to="/" style={styles.navLink}>
                Upload Resume
              </Link>
            </li>
            <li style={styles.navItem}>
              <Link to="/job-posting" style={styles.navLink}>
                Create Job Posting
              </Link>
            </li>
            <li style={styles.navItem}>
              <Link to="/candidate-signup" style={styles.navLink}>
                Candidate Signup
              </Link>{" "}
              {/* Link to candidate signup */}
            </li>
          </ul>
        </nav>
        <div style={styles.container}>
          <Routes>
            <Route path="/" element={<UploadResume />} />
            <Route path="/job-posting" element={<JobPosting />} />
            <Route path="/candidate-signup" element={<CandSignup />} />{" "}
            {/* Route for candidate signup */}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

// Inline styles for better organization
const styles = {
  appContainer: {
    fontFamily: "Arial, sans-serif",
    margin: "0 auto",
    padding: "20px",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  nav: {
    marginBottom: "20px",
  },
  navList: {
    listStyleType: "none",
    padding: 0,
    display: "flex",
    justifyContent: "center",
  },
  navItem: {
    margin: "0 15px",
  },
  navLink: {
    textDecoration: "none",
    color: "blue",
  },
  container: {
    marginTop: "20px",
  },
};

export default App;
