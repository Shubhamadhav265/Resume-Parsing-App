import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const HRDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  // Fetch posted jobs from job_posting table
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/jobs"); // Adjust the endpoint for fetching jobs
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching job postings:", error);
      }
    };

    fetchJobs();
  }, []);

  // Handler for navigating to Post Job component
  const handlePostJob = () => {
    navigate("/job-posting");
  };

  return (
    <div>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <ul style={styles.navList}>
          <li><Link to="/hr-dashboard">Home</Link></li>
          <li><Link to="/hr-profile">Profile</Link></li>
          <li><Link to="/logout">Logout</Link></li>
        </ul>
      </nav>

      {/* Posted Jobs Section */}
      <div style={styles.container}>
        <h2>Posted Jobs</h2>
        <div style={styles.jobList}>
          {jobs.map((job) => (
            <div key={job.id} style={styles.jobCard}>
              <h3>{job.role}</h3>
              <p><strong>Company:</strong> {job.company_name}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Salary:</strong> {job.salary_range}</p>
              <p><strong>Primary Skills:</strong> {job.primary_skills}</p>
              <p><strong>Secondary Skills:</strong> {job.secondary_skills}</p>
              <p><strong>Work Mode:</strong> {job.work_mode}</p>

              {/* See Students Rankings Button */}
              <button
                onClick={() => navigate(`/student-rankings/${job.id}`)}
                style={styles.button}
              >
                See Students Rankings
              </button>
            </div>
          ))}
        </div>

        {/* Post a Job Button */}
        <button onClick={handlePostJob} style={styles.postJobButton}>
          Post a Job
        </button>
      </div>
    </div>
  );
};

const styles = {
  navbar: {
    backgroundColor: "cyan",
    padding: "10px 20px",
  },
  navList: {
    display: "flex",
    justifyContent: "space-between",
    listStyleType: "none",
    padding: 0,
  },
  navItem: {
    color: "#fff",
    textDecoration: "none",
  },
  container: {
    padding: "20px",
    textAlign: "center",
  },
  jobList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },
  jobCard: {
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#f9f9f9",
  },
  button: {
    marginTop: "10px",
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  postJobButton: {
    padding: "15px 30px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default HRDashboard;