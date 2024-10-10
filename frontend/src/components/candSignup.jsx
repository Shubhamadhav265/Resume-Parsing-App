import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './candSignUp.css'; // Correctly link the CSS file

const Signup = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    contact_number: "",
    degree: "",
    cgpa: "",
    graduation_year: "",
    college_name: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

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
      college_name,
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
      !college_name ||
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
        "http://localhost:5000/candidate-signup",
        formData
      );
      setSuccess(response.data.message);
      setError("");
      setFormData({
        full_name: "",
        email: "",
        contact_number: "",
        degree: "",
        cgpa: "",
        graduation_year: "",
        college_name: "",
        password: "",
        confirm_password: "",
      });
      
      setTimeout(() => {
        navigate("/candidate-login");
      }, 2000);
    } catch (error) {
      setError(error.response ? error.response.data.error : "An error occurred");
      setSuccess("");
    }
  };

  return (
    <div className="signup-container">
      <h2>Candidate Signup</h2>
      {error && <p className="signup-error">{error}</p>}
      {success && <p className="signup-success">{success}</p>}
      <form onSubmit={handleSubmit} className="signup-form">
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="text"
          name="contact_number"
          placeholder="Contact Number"
          value={formData.contact_number}
          onChange={handleChange}
        />
        <input
          type="text"
          name="degree"
          placeholder="Degree"
          value={formData.degree}
          onChange={handleChange}
        />
        <input
          type="number"
          name="cgpa"
          placeholder="CGPA"
          value={formData.cgpa}
          onChange={handleChange}
        />
        <input
          type="number"
          name="graduation_year"
          placeholder="Graduation Year"
          value={formData.graduation_year}
          onChange={handleChange}
        />
        <input
          type="text"
          name="college_name"
          placeholder="College Name"
          value={formData.college_name}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          value={formData.confirm_password}
          onChange={handleChange}
        />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
