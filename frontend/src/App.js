import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import CandSignup from "./components/candSignUp";
import HRSignup from "./components/HRSignUp";
import HRSignin from "./components/HRSignIn";
import CandSignin from "./components/candSignIn"; // Candidate sign-in component
import LandingPage from "./components/LandingPage";
import HrDashboard from "./components/HrDashBoard";
import CandDashboard from "./components/CandDashBoard";
import JobPosting from "./components/JobPosting";
import StudentRankings from "./components/studentRankings";

const App = () => {
  return (
    <Router>
      <div style={styles.appContainer}>
        <h1 style={styles.title}>Recruitment Portal</h1>
        <nav style={styles.nav}>
          <ul style={styles.navList}>
            <li style={styles.navItem}>
              <Link to="/" style={styles.navLink}>
                Home
              </Link>
            </li>
            <li style={styles.navItem}>
              <Link to="/job-posting" style={styles.navLink}>
                Create Job Posting
              </Link>
            </li>
          </ul>
        </nav>

        <div style={styles.container}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/candidate-signup" element={<CandSignup />} />
            <Route path="/candidate-signin" element={<CandSignin />} />
            <Route path="/hr-signup" element={<HRSignup />} />
            <Route path="/hr-signin" element={<HRSignin />} />
            <Route path="/hr-dashboard" element={<HrDashboard />} />
            <Route path="/cand-dashboard" element={<CandDashboard />} />
            <Route path="/job-posting" element={<JobPosting />} />
            <Route path="/student-rankings/:job_id" element={<StudentRankings />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

const styles = {
  appContainer: {
    textAlign: "center",
    padding: "20px",
  },
  title: {
    fontSize: "2.5em",
    margin: "10px 0",
  },
  nav: {
    marginBottom: "20px",
  },
  navList: {
    listStyle: "none",
    padding: 0,
    display: "flex",
    justifyContent: "center",
  },
  navItem: {
    margin: "0 15px",
  },
  navLink: {
    textDecoration: "none",
    color: "#4CAF50",
    fontSize: "1.2em",
  },
  container: {
    padding: "20px",
  },
};

export default App;