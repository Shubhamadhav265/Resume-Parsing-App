import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import UploadResume from "./UploadResume";
import JobPosting from "./JobPosting";
import CandSignup from "./components/candSignUp"; // Importing the existing candidate signup component
import HRSignup from "./components/HRSignUp"; // Importing the existing HR signup component
import CandSignIn from "./components/candSignIn" // Importing the existing candidate signin component
import HRSignIn from "./components/HRSignIn"; // Importing the existing HR signin component

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
            <li style={styles.navItem}>
              <Link to="/hr-signup" style={styles.navLink}>
                HR Signup
              </Link>{" "}
              {/* Link to HR signup */}
            </li>
            <li style={styles.navItem}>
              <Link to="/candidate-signin" style={styles.navLink}>
                Candidate Signin
              </Link>{" "}
              {/* Link to Candidate Signin */}
            </li>
            <li style={styles.navItem}>
              <Link to="/hr-signin" style={styles.navLink}>
                HR Signin
              </Link>{" "}
              {/* Link to HR Signin */}
            </li>
          </ul>
        </nav>
        <div style={styles.container}>
          <Routes>
            <Route path="/" element={<UploadResume />} />
            <Route path="/job-posting" element={<JobPosting />} />
            <Route path="/candidate-signup" element={<CandSignup />} />{" "}
            {/* Route for candidate signup */}
            <Route path="/hr-signup" element={<HRSignup />} />{" "}
            {/* Route for HR signup */}
            <Route path="/candidate-signin" element={<CandSignIn />} />{" "}
            {/* Route for Candidate signUp */}
            <Route path="/hr-signin" element={<HRSignIn />} />{" "}
            {/* Route for HR signIn */}
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
