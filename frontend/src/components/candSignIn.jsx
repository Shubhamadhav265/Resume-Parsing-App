import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const Signin = () => {
const [formData, setFormData] = useState({
    email: "",
    password: "",
});

const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const navigate = useNavigate();

const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    // Basic validation
    if (!email || !password) {
    setError("All fields are required.");
    return;
    }

    try {
    const response = await axios.post(
        "http://localhost:5000/candidate-signin", // Update the endpoint as needed
        formData
    );
    setSuccess(response.data.message);
    setError("");

    // Optionally, handle successful sign-in (e.g., redirect, store token, etc.)
    console.log("Sign-in successful:", response.data);
    navigate('/applied-jobs'); // Redirect to Candidate Dashboard on successful sign-in
    } catch (error) {
    setError(
        error.response ? error.response.data.error : "An error occurred"
    );
    setSuccess("");
    }
};

return (
    <div style={styles.container}>
    <h2 style={styles.heading}>Candidate Sign In</h2>
    {error && <p style={styles.error}>{error}</p>}
    {success && <p style={styles.success}>{success}</p>}
    <form onSubmit={handleSubmit} style={styles.form}>
        <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
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
        <button type="submit" style={styles.button}>
        Sign In
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
    backgroundColor: "f9f9f9",
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
    border: "1px solid ccc",
},
button: {
    padding: "10px",
    backgroundColor: "007bff",
    color: "fff",
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

export default Signin;
