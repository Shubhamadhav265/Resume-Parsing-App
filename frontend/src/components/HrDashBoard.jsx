import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const HRDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/posted-jobs", {
          withCredentials: true,
        });
        setJobs(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching job postings:", error);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handlePostJob = () => {
    navigate("/job-posting");
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/logout",
        {},
        { withCredentials: true }
      );
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Roboto', sans-serif",
        backgroundColor: "#f9fafc",
        minHeight: "100vh",
        padding: "0px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>HR Dashboard</div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </nav>

      {/* Posted Jobs Section */}
      <div style={styles.container}>
        <h2 style={styles.heading}>Posted Jobs</h2>

        {loading ? (
          <div style={styles.spinner}>
            <div className="spinner"></div>
            Loading jobs...
          </div>
        ) : (
          <div style={styles.jobList}>
            {jobs.map((job) => (
              <div key={job.job_id} style={styles.jobCard}>
                <h3 style={styles.jobTitle}>{job.role}</h3>
                <p>
                  <strong>Company:</strong> {job.company_name}
                </p>
                <p>
                  <strong>Location:</strong> {job.location}
                </p>
                <p>
                  <strong>Salary:</strong> {job.salary_range}
                </p>
                <p>
                  <strong>Primary Skills:</strong> {job.primary_skills}
                </p>
                <p>
                  <strong>Secondary Skills:</strong> {job.secondary_skills}
                </p>
                <p>
                  <strong>Work Mode:</strong> {job.work_mode}
                </p>

                <button
                  onClick={() => navigate(`/student-rankings/${job.job_id}`)}
                  style={styles.viewButton}
                >
                  See Students Rankings
                </button>
              </div>
            ))}
          </div>
        )}

        <button onClick={handlePostJob} style={styles.postJobButton}>
          Post a Job
        </button>
      </div>
    </div>
  );
};

const styles = {
  navbar: {
    backgroundColor: "#2c3e50", // Original navbar color
    color: "#fff",
    padding: "15px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  logoutButton: {
    padding: "10px 20px",
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  container: {
    padding: "20px",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    fontSize: "2rem",
    color: "#495057",
    marginBottom: "20px",
    textAlign: "center",
  },
  jobList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  jobCard: {
    padding: "60px",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
    ":hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 8px 15px rgba(0, 0, 0, 0.2)",
    },
  },
  jobTitle: {
    fontSize: "1.25rem",
    marginBottom: "10px",
    color: "#2c3e50",
  },
  viewButton: {
    marginTop: "10px",
    padding: "10px 15px",
    backgroundColor: "#1c7ed6",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    alignSelf: "flex-start",
    transition: "background-color 0.3s ease",
  },
  postJobButton: {
    marginTop: "30px",
    alignSelf: "center",
    padding: "12px 25px",
    backgroundColor: "#38d9a9",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
  },
  spinner: {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#6c757d",
  },
};

export default HRDashboard;
