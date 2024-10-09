import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    contact_number: "",
    degree: "",
    cgpa: "",
    graduation_year: "",
    college_name: "", // Added College Name
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      full_name,
      email,
      contact_number,
      degree,
      cgpa,
      graduation_year,
      college_name, // Added College Name
      password,
      confirm_password,
    } = formData;

    // Basic validation
    if (
      !full_name ||
      !email ||
      !contact_number ||
      !degree ||
      !cgpa ||
      !graduation_year ||
      !college_name || // Included College Name
      !password ||
      !confirm_password
    ) {
      setError("All fields are required.");
      console.log("Form Data:", formData); // Log form data
      return;
    }
    if (password !== confirm_password) {
      setError("Passwords do not match.");
      console.log("Form Data:", formData); // Log form data
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/candidate-signup",
        formData
      );
      console.log("Response:", response); // Log the response
      setSuccess(response.data.message);
      setError("");
      
      // Clear form after successful signup
      setFormData({
        full_name: "",
        email: "",
        contact_number: "",
        degree: "",
        cgpa: "",
        graduation_year: "",
        college_name: "", // Clear College Name
        password: "",
        confirm_password: "",
      });
      
      // Redirect to candidate login page after successful signup
      setTimeout(() => {
        navigate("/candidate-login");
      }, 2000); // Delay redirection by 2 seconds to show success message

    } catch (error) {
      console.error("Error:", error); // Log any errors
      setError(
        error.response ? error.response.data.error : "An error occurred"
      );
      setSuccess("");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Candidate Signup</h2>
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="text"
          name="contact_number"
          placeholder="Contact Number"
          value={formData.contact_number}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="text"
          name="degree"
          placeholder="Degree"
          value={formData.degree}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="number"
          name="cgpa"
          placeholder="CGPA"
          value={formData.cgpa}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="number"
          name="graduation_year"
          placeholder="Graduation Year"
          value={formData.graduation_year}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="text"
          name="college_name" // New field for College Name
          placeholder="College Name"
          value={formData.college_name} // New field for College Name
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          value={formData.confirm_password}
          onChange={handleChange}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Signup
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "0 auto",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#f9f9f9",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
  success: {
    color: "green",
    textAlign: "center",
  },
};

export default Signup;