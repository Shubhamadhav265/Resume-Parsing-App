import React, { useState } from 'react';
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";

function JobPosting() {
  const [formData, setFormData] = useState({
    company_name: '',
    job_description: '',
    role: '',
    primary_skills: '',
    secondary_skills: '',
    other_skills: '',
    package: '',
    stipend_amount: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
    setError(''); // Clear any previous errors
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/job-posting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || 'Failed to create job posting.');
      }

      const data = await response.json();
      setMessage(data.message);
      setFormData({
        company_name: '',
        job_description: '',
        role: '',
        primary_skills: '',
        secondary_skills: '',
        other_skills: '',
        package: '',
        stipend_amount: ''
      }); // Reset form after successful submission

      // Redirect to candidate login page after successful signup
      setTimeout(() => {
        navigate("/hr-dashboard");
      }, 2000); // Delay redirection by 2 seconds to show success message

    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setMessage(''); // Clear message if there was an error
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create Job Posting</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          name="company_name"
          value={formData.company_name}
          onChange={handleChange}
          placeholder="Company Name"
          style={styles.input}
          required
        />
        <textarea
          name="job_description"
          value={formData.job_description}
          onChange={handleChange}
          placeholder="Job Description"
          style={styles.textarea}
          required
        />
        <input
          type="text"
          name="role"
          value={formData.role}
          onChange={handleChange}
          placeholder="Role"
          style={styles.input}
          required
        />
        <input
          type="text"
          name="primary_skills"
          value={formData.primary_skills}
          onChange={handleChange}
          placeholder="Primary Skills (comma-separated)"
          style={styles.input}
          required
        />
        <input
          type="text"
          name="secondary_skills"
          value={formData.secondary_skills}
          onChange={handleChange}
          placeholder="Secondary Skills (comma-separated)"
          style={styles.input}
          required
        />
        <input
          type="text"
          name="other_skills"
          value={formData.other_skills}
          onChange={handleChange}
          placeholder="Other Skills (comma-separated)"
          style={styles.input}
        />
        <input
          type="text"
          name="package"
          value={formData.package}
          onChange={handleChange}
          placeholder="Package"
          style={styles.input}
          required
        />
        <input
          type="text"
          name="stipend_amount"
          value={formData.stipend_amount}
          onChange={handleChange}
          placeholder="Stipend Amount"
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>Create Job Posting</button>
      </form>
      {message && <div style={styles.successMessage}>{message}</div>}
      {error && <div style={styles.errorMessage}>Error: {error}</div>}
    </div>
  );
}

// CSS Styles as a JavaScript object
const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '10px'
  },
  heading: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '16px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '16px',
    minHeight: '100px',
    resize: 'vertical'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: 'white',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  },
  successMessage: {
    color: 'green',
    marginTop: '20px',
    textAlign: 'center'
  },
  errorMessage: {
    color: 'red',
    marginTop: '20px',
    textAlign: 'center'
  }
};

export default JobPosting;