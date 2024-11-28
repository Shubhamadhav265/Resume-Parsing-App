import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UploadResume from "./UploadResume";
import Feedback from "./Feedback";

const CandDashBoard = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [isUploadResumeModalOpen, setIsUploadResumeModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/applied-jobs", {
          withCredentials: true,
        });
        setAppliedJobs(response.data);
      } catch (error) {
        console.error("Error fetching applied jobs:", error);
      }
    };

    const fetchAvailableJobs = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/available-jobs",
          {
            withCredentials: true,
          }
        );
        setAvailableJobs(response.data);
      } catch (error) {
        console.error("Error fetching available jobs:", error);
      }
    };

    fetchAppliedJobs();
    fetchAvailableJobs();
  }, []);

  const handleApply = (jobId, jobTitle, companyName) => {
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobTitle);
    setSelectedCompanyName(companyName);
    setIsUploadResumeModalOpen(true); // Open UploadResume modal
  };

  const closeUploadResumeModal = () => {
    setIsUploadResumeModalOpen(false); // Close UploadResume modal
    setSelectedJobId(null);
    setSelectedJobTitle(null);
    setSelectedCompanyName(null);
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

  const removeJobFromAvailable = (jobId) => {
    setAvailableJobs((prevJobs) =>
      prevJobs.filter((job) => job.job_id !== jobId)
    );
  };

  const addJobToApplied = (jobDetails) => {
    setAppliedJobs((prevJobs) => [...prevJobs, jobDetails]);
  };

  const handleFeedback = async (jobId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/feedback/${jobId}`,
        {
          withCredentials: true,
        }
      );
      setFeedback(response.data.feedback);
      setIsFeedbackModalOpen(true);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setFeedback("");
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>Candidate Dashboard</div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </nav>

      {/* Applied Jobs Section */}
      <div style={styles.content}>
        <h2 style={styles.heading}>Applied Jobs</h2>
        <div style={styles.jobContainer}>
          {appliedJobs.length > 0 ? (
            appliedJobs.map((job) => (
              <div key={job.id} style={styles.jobCard}>
                <h4 style={styles.jobTitle}>{job.title}</h4>
                <p style={styles.jobCompany}>{job.company_name}</p>
                <p style={styles.jobStatus}>{job.status}</p>
                {(job.status === "Shortlisted" ||
                  job.status === "Rejected") && (
                  <button
                    onClick={() => {
                      handleFeedback(job.job_id);
                    }}
                    style={styles.feedbackButton}
                  >
                    Feedback
                  </button>
                )}
              </div>
            ))
          ) : (
            <p style={styles.noJobsText}>No applied jobs found.</p>
          )}
        </div>

        {/* Available Jobs Section */}
        <h2 style={styles.heading}>Available Jobs</h2>
        <div style={styles.jobContainer}>
          {availableJobs.length > 0 ? (
            availableJobs.map((job) => (
              <div key={job.job_id} style={styles.jobCard}>
                <h4 style={styles.jobTitle}>{job.title}</h4>
                <p style={styles.jobCompany}>{job.company_name}</p>
                <p style={styles.jobDescription}>{job.description}</p>
                <p style={styles.jobPackage}>Package: {job.package || "N/A"}</p>
                <p style={styles.jobStipend}>
                  Stipend: {job.stipend_amount || "N/A"}
                </p>
                <button
                  onClick={() =>
                    handleApply(job.job_id, job.title, job.company_name)
                  }
                  style={styles.applyButton}
                >
                  Apply
                </button>
              </div>
            ))
          ) : (
            <p style={styles.noJobsText}>No available jobs found.</p>
          )}
        </div>
      </div>

      {/* UploadResume Modal */}
      {isUploadResumeModalOpen && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalContent}>
            <UploadResume
              onClose={closeUploadResumeModal}
              jobId={selectedJobId}
              jobTitle={selectedJobTitle}
              companyName={selectedCompanyName}
              onJobUploaded={(jobDetails) => {
                removeJobFromAvailable(jobDetails.job_id);
                addJobToApplied(jobDetails);
                closeUploadResumeModal();
              }}
            />
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalContent}>
            <Feedback feedback={feedback} onClose={closeFeedbackModal} />
          </div>
        </div>
      )}
    </div>
  );
};


const styles = {
  navbar: {
    backgroundColor: "#2c3e50",
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
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: "#f9fafc",
    minHeight: "100vh",
  },
  content: {
    padding: "20px",
  },
  heading: {
    fontSize: "2rem",
    color: "#495057",
    marginBottom: "20px",
    textAlign: "center",
  },
  jobContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  jobCard: {
    padding: "40px",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  jobTitle: {
    fontSize: "1.25rem",
    marginBottom: "10px",
    color: "#2c3e50",
  },
  feedbackButton: {
    marginTop: "10px",
    padding: "10px 15px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  applyButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  noJobsText: {
    textAlign: "center",
    color: "#777",
  },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    width: "400px",
    maxWidth: "90%",
  },
};

export default CandDashBoard;
