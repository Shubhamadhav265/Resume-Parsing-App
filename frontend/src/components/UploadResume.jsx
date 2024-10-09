import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UploadResume = ({ onClose, jobId }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");

    const navigate = useNavigate(); // Use the useNavigate hook

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file to upload.");
            return;
        }

        // Create FormData to send file and job_id
        const formData = new FormData();
        formData.append("file", file);
        formData.append("job_id", jobId); // Add job_id to the form data

        try {
            const response = await axios.post("http://localhost:5000/upload", formData, {
                withCredentials: true,  // Ensure session cookie is sent with the request
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            // Handle successful upload
            console.log("Resume uploaded successfully:", response.data);
            navigate("/cand-dashboard"); 
            onClose(); // Close the upload modal
        } catch (error) {
            console.error("Error uploading resume:", error);
            setError("Failed to upload resume.");
        }
    };

    return (
        <div style={styles.modal}>
            <h3>Upload Resume</h3>
            {error && <p style={styles.errorText}>{error}</p>}
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} style={styles.uploadButton}>Upload</button>
            <button onClick={onClose} style={styles.closeButton}>Close</button>
        </div>
    );
};

const styles = {
    modal: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        maxWidth: "400px",
        margin: "0 auto",
        textAlign: "center",
    },
    errorText: {
        color: "red",
        marginBottom: "10px",
    },
    uploadButton: {
        marginRight: "10px",
    },
    closeButton: {
        backgroundColor: "#f44336",
        color: "#fff",
    },
};

export default UploadResume;