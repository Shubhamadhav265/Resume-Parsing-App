import React, { useState } from "react";

function UploadResume() {
  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError(""); // Clear any previous errors
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert("Please select a file before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.error || "Failed to upload file.");
      }

      const data = await response.json();
      setSkills(data.skills);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message); // Set the error message for display
      setSkills(""); // Clear skills if there was an error
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept=".pdf" required />
        <button type="submit">Upload Resume</button>
      </form>
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
      {skills && <div>Extracted Skills: {skills}</div>}
    </div>
  );
}

export default UploadResume;
