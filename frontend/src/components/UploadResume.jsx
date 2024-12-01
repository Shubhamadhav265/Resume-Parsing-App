import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UploadResume = ({
  jobId,
  jobTitle,
  companyName,
  onJobUploaded,
  onClose,
}) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_id", jobId);

    try {
      const response = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Resume uploaded successfully:", response.data);

      // Prepare job details with title and company name
      const jobDetails = {
        job_id: jobId,
        title: jobTitle, // Using props jobTitle
        company_name: companyName, // Using props companyName
        status: "Pending", // Manually set the status
      };

      // Call the callback with job details to update the applied jobs
      onJobUploaded(jobDetails);
      setLoading(false);
      navigate("/cand-dashboard", { replace: true });
      onClose();
    } catch (error) {
      console.error("Error uploading resume:", error);
      setError("Failed to upload resume.");
      setLoading(false);
    }
  };

  return (
    <div style={styles.modal}>
      <h3>Upload Resume</h3>
      <br />
      {error && <p style={styles.errorText}>{error}</p>}
      <input type="file" onChange={handleFileChange} />
      
      {loading ? (
        <>
          <img width={50}
            src="https://i.pinimg.com/originals/07/24/88/0724884440e8ddd0896ff557b75a222a.gif"
            alt=""
          />
        </>
      ) : (
        <><button onClick={handleUpload} style={styles.uploadButton}>
        Upload
      </button></>
      )}
      <br />

      <button onClick={onClose} style={styles.closeButton}>
        Close
      </button>
    </div>
  );
};

const styles = {
  modal: {
    backgroundColor: "#fff",
    padding: "25px",
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
    padding: "2px",
  },
  closeButton: {
    padding: "5px 10px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    margin: "5px",
  },
};

export default UploadResume;
