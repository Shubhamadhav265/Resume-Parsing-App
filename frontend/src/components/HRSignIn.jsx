import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { jwtDecode } from 'jwt-decode';

const HRSignin = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000; // Current time in seconds

            if (decodedToken.exp > currentTime) {
                // Token is valid, redirect to dashboard
                navigate('/jobs');
            }
        }
    }, [navigate]);

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
                "http://localhost:5000/hr-signin",
                formData
            );

            // Store the access token in localStorage
            localStorage.setItem('access_token', response.data.access_token);
            setSuccess(response.data.message);
            setError("");

            // Redirect to HR Dashboard on successful sign-in
            console.log("Sign-in successful:", response.data);
            navigate('/jobs');
        } catch (error) {
            setError(
                error.response ? error.response.data.error : "An error occurred"
            );
            setSuccess("");
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>HR Sign In</h2>
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

export default HRSignin;
