import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UploadResume from "./UploadResume";

const CandDashBoard = () => {
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [availableJobs, setAvailableJobs] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [selectedJobTitle, setSelectedJobTitle] = useState(null);
    const [selectedCompanyName, setSelectedCompanyName] = useState(null);

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
                const response = await axios.get("http://localhost:5000/available-jobs", {
                    withCredentials: true,
                });
                setAvailableJobs(response.data);
            } catch (error) {
                console.error("Error fetching available jobs:", error);
            }
        };

        fetchAppliedJobs();
        fetchAvailableJobs();
    }, []);

    const handleApply = (jobId, jobTitle, companyName) => {
        console.log(`Applying for job ID: ${jobId}`);
        setSelectedJobId(jobId);
        setSelectedJobTitle(jobTitle);
        setSelectedCompanyName(companyName);
        setIsUploading(true);
    };

    const closeUploadResume = () => {
        setIsUploading(false);
        setSelectedJobId(null);
        setSelectedJobTitle(null);
        setSelectedCompanyName(null);
    };

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:5000/logout", {}, { withCredentials: true });
            navigate("/");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    // New function to remove job from available jobs
    const removeJobFromAvailable = (jobId) => {
        setAvailableJobs((prevJobs) => prevJobs.filter((job) => job.job_id !== jobId));
    };

    // New function to add applied job in the applied job section
    const addJobToApplied = (jobDetails) => {
        setAppliedJobs((prevJobs) => [...prevJobs, jobDetails]); // Add the applied job to the appliedJobs state
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Candidate Dashboard</h2>
            <button onClick={handleLogout} style={styles.logoutButton}>
                Logout
            </button>
            <h3 style={styles.subHeading}>Applied Jobs</h3>
            <div style={styles.jobContainer}>
                {appliedJobs.length > 0 ? (
                    appliedJobs.map((job) => (
                        <div key={job.id} style={styles.jobCard}>
                            <h4 style={styles.jobTitle}>{job.title}</h4>
                            <p style={styles.jobCompany}>{job.company_name}</p>
                            <p style={styles.jobStatus}>{job.status}</p>
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
                            <button
                                onClick={() => handleApply(job.job_id, job.title, job.company_name)}
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

            {isUploading && (
                <UploadResume
                    onClose={closeUploadResume}
                    jobId={selectedJobId}
                    jobTitle={selectedJobTitle}
                    companyName={selectedCompanyName}
                    onJobUploaded={(jobDetails) => {
                        removeJobFromAvailable(jobDetails.job_id);
                        addJobToApplied(jobDetails); // Call to add the applied job
                    }}
                />
            )}
        </div>
    );
};


// Define styles here...

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
    logoutButton: {
        padding: "10px 15px",
        backgroundColor: "#dc3545",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
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