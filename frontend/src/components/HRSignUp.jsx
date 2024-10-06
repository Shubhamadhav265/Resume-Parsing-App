import React, { useState } from "react";
import axios from "axios";

const HRSignup = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    contact_number: "",
    company_name: "",
    position: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      full_name,
      email,
      contact_number,
      company_name,
      position,
      password,
      confirm_password,
    } = formData;

    // Basic validation
    if (
      !full_name ||
      !email ||
      !contact_number ||
      !company_name ||
      !position ||
      !password ||
      !confirm_password
    ) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/hr-signup", // Adjust backend endpoint
        formData
      );
      setSuccess(response.data.message);
      setError("");

      // Clear form after successful signup
      setFormData({
        full_name: "",
        email: "",
        contact_number: "",
        company_name: "",
        position: "",
        password: "",
        confirm_password: "",
      });
    } catch (error) {
      setError(
        error.response ? error.response.data.error : "An error occurred"
      );
      setSuccess("");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>HR Signup</h2>
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
          name="company_name"
          placeholder="Company Name"
          value={formData.company_name}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="text"
          name="position"
          placeholder="Position"
          value={formData.position}
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
    backgroundColor: "#007bff",
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

export default HRSignup;
