import React, { useEffect, useState } from "react";
import axios from "axios";
import UploadResume from "./UploadResume"; // Import the UploadResume component

const CandDashBoard = () => {
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [availableJobs, setAvailableJobs] = useState([]);
    const [isUploading, setIsUploading] = useState(false); // State to control visibility of UploadResume
    const [selectedJobId, setSelectedJobId] = useState(null); // State to store selected job_id

    useEffect(() => {
        // Fetch applied jobs from the backend
        const fetchAppliedJobs = async () => {
            try {
                const response = await axios.get("http://localhost:5000/applied-jobs", {
                    withCredentials: true,  // Ensure session cookie is sent with the request
                }); // Update endpoint as needed
                setAppliedJobs(response.data); // Assuming the response contains an array of applied jobs
            } catch (error) {
                console.error("Error fetching applied jobs:", error);
            }
        };

        // Fetch available jobs from the backend
        const fetchAvailableJobs = async () => {
            try {
                const response = await axios.get("http://localhost:5000/available-jobs", {
                    withCredentials: true,  // Ensure session cookie is sent with the request
                }); // Updated endpoint
                setAvailableJobs(response.data); // Assuming the response contains an array of available jobs
            } catch (error) {
                console.error("Error fetching available jobs:", error);
            }
        };

        fetchAppliedJobs();
        fetchAvailableJobs();
    }, []);

    const handleApply = (jobId) => {
        console.log(`Applying for job ID: ${jobId}`);
        setSelectedJobId(jobId); // Store selected job_id
        setIsUploading(true); // Show the upload resume component
    };

    const closeUploadResume = () => {
        setIsUploading(false); // Hide the upload resume component
        setSelectedJobId(null); // Clear selected job_id
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
                            <p style={styles.jobCompany}>{job.company_name}</p>
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
                        <div key={job.job_id} style={styles.jobCard}>
                            <h4 style={styles.jobTitle}>{job.title}</h4>
                            <p style={styles.jobCompany}>{job.company_name}</p>
                            <p style={styles.jobDescription}>{job.description}</p>
                            <p style={styles.jobPackage}>
                                Package: {job.package || "N/A"}
                            </p>
                            <p style={styles.jobStipend}>
                                Stipend: {job.stipend_amount || "N/A"}
                            </p>
                            <button onClick={() => handleApply(job.job_id)} style={styles.applyButton}>
                                Apply
                            </button>
                        </div>
                    ))
                ) : (
                    <p style={styles.noJobsText}>No available jobs found.</p>
                )}
            </div>

            {/* Conditional rendering of UploadResume component */}
            {isUploading && <UploadResume onClose={closeUploadResume} jobId={selectedJobId} />}  {/* Pass jobId as a prop */}
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
    jobDescription: {
        margin: "5px 0",
        color: "#555",
    },
    jobPackage: {
        margin: "5px 0",
        color: "#28a745",
    },
    jobStipend: {
        margin: "5px 0",
        color: "#17a2b8",
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
    noJobsText: {
        textAlign: "center",
        color: "#999",
    },
};

export default CandDashBoard;