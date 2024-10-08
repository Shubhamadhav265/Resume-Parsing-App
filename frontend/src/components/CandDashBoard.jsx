import React, { useEffect, useState } from "react";
import axios from "axios";

const CandDashBoard = () => {
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [availableJobs, setAvailableJobs] = useState([]);

    useEffect(() => {
        // Fetch applied jobs from the backend
        const fetchAppliedJobs = async () => {
            try {
                const response = await axios.get("http://localhost:5000/applied-jobs"); // Update endpoint as needed
                setAppliedJobs(response.data); // Assuming the response contains an array of applied jobs
            } catch (error) {
                console.error("Error fetching applied jobs:", error);
            }
        };

        // Fetch available jobs from the backend
        const fetchAvailableJobs = async () => {
            try {
                const response = await axios.get("http://localhost:5000/job-postings"); // Update endpoint as needed
                setAvailableJobs(response.data); // Assuming the response contains an array of available jobs
            } catch (error) {
                console.error("Error fetching available jobs:", error);
            }
        };

        fetchAppliedJobs();
        fetchAvailableJobs();
    }, []);

    const handleApply = (jobId) => {
        // Implement the apply functionality here
        console.log(`Applying for job ID: ${jobId}`);
        // You can show the upload resume component here
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Candidate Dashboard</h2>

            <h3 style={styles.subHeading}>Applied Jobs</h3>
            <div style={styles.jobContainer}>
                {appliedJobs.length > 0 ? (
                    appliedJobs.map((job) => (
                        <div key={job.id} style={styles.jobCard}>
                            <h4 style={styles.jobTitle}>{job.title}</h4>
                            <p style={styles.jobCompany}>{job.company}</p>
                            <p style={styles.jobStatus}>{job.status}</p> {/* Example of status */}
                        </div>
                    ))
                ) : (
                    <p style={styles.noJobsText}>No applied jobs found.</p>
                )}
            </div>

            <h3 style={styles.subHeading}>Available Jobs</h3>
            <div style={styles.jobContainer}>
                {availableJobs.length > 0 ? (
                    availableJobs.map((job) => (
                        <div key={job.id} style={styles.jobCard}>
                            <h4 style={styles.jobTitle}>{job.title}</h4>
                            <p style={styles.jobCompany}>{job.company}</p>
                            <button onClick={() => handleApply(job.id)} style={styles.applyButton}>
                                Apply
                            </button>
                        </div>
                    ))
                ) : (
                    <p style={styles.noJobsText}>No available jobs found.</p>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        maxWidth: "800px",
        margin: "0 auto",
    },
    heading: {
        textAlign: "center",
        marginBottom: "20px",
        fontSize: "24px",
        color: "#333",
    },
    subHeading: {
        marginTop: "20px",
        marginBottom: "10px",
        fontSize: "20px",
        color: "#555",
    },
    jobContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    jobCard: {
        padding: "15px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        backgroundColor: "#fff",
        transition: "box-shadow 0.2s",
        cursor: "pointer",
    },
    jobTitle: {
        fontSize: "18px",
        margin: "0 0 5px 0",
        color: "#007bff",
    },
    jobCompany: {
        margin: "5px 0",
        color: "#777",
    },
    jobStatus: {
        margin: "5px 0",
        color: "#28a745",
    },
    applyButton: {
        padding: "10px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        transition: "background-color 0.2s",
    },
    applyButtonHover: {
        backgroundColor: "#0056b3",
    },
    noJobsText: {
        textAlign: "center",
        color: "#999",
    },
};

export default CandDashBoard;