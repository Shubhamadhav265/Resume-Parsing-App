import React, { useState } from 'react';

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

    // Add a dummy user ID for testing purposes
    const dataToSend = {
      ...formData,
      user_id: 1  // You can set a fixed user_id here for testing
    };

    try {
      const response = await fetch('http://localhost:5000/job-posting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
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
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setMessage(''); // Clear message if there was an error
    }
  };

  return (
    <div>
      <h2>Create Job Posting</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="company_name"
          value={formData.company_name}
          onChange={handleChange}
          placeholder="Company Name"
          required
        />
        <textarea
          name="job_description"
          value={formData.job_description}
          onChange={handleChange}
          placeholder="Job Description"
          required
        />
        <input
          type="text"
          name="role"
          value={formData.role}
          onChange={handleChange}
          placeholder="Role"
          required
        />
        <input
          type="text"
          name="primary_skills"
          value={formData.primary_skills}
          onChange={handleChange}
          placeholder="Primary Skills (comma-separated)"
          required
        />
        <input
          type="text"
          name="secondary_skills"
          value={formData.secondary_skills}
          onChange={handleChange}
          placeholder="Secondary Skills (comma-separated)"
          required
        />
        <input
          type="text"
          name="other_skills"
          value={formData.other_skills}
          onChange={handleChange}
          placeholder="Other Skills (comma-separated)"
        />
        <input
          type="text"
          name="package"
          value={formData.package}
          onChange={handleChange}
          placeholder="Package"
          required
        />
        <input
          type="text"
          name="stipend_amount"
          value={formData.stipend_amount}
          onChange={handleChange}
          placeholder="Stipend Amount"
          required
        />
        <button type="submit">Create Job Posting</button>
      </form>
      {message && <div style={{ color: 'green' }}>{message}</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
    </div>
  );
}

export default JobPosting;
