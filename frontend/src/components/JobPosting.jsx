import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function JobPosting() {
  const [formData, setFormData] = useState({
    company_name: "",
    job_description: "",
    role: "",
    primary_skills_name: "",
    secondary_skills_name: "",
    other_skills_name: "",
    pri_skills_wt: 33,
    sec_skills_wt: 33,
    oth_skills_wt: 34,
    package: "",
    stipend_amount: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSliderChange = (event) => {
    const { name, value } = event.target;
    const newValue = parseInt(value, 10);

    const total =
      formData.pri_skills_wt +
      formData.sec_skills_wt +
      formData.oth_skills_wt;

    const otherSliders = {
      pri_skills_wt: ["sec_skills_wt", "oth_skills_wt"],
      sec_skills_wt: ["pri_skills_wt", "oth_skills_wt"],
      oth_skills_wt: ["pri_skills_wt", "sec_skills_wt"],
    };

    const [slider1, slider2] = otherSliders[name];
    const otherTotal = formData[slider1] + formData[slider2];

    if (total !== 100) {
      const remainingPercentage = 100 - newValue;

      const slider1NewValue = Math.round(
        (formData[slider1] / otherTotal) * remainingPercentage
      );
      const slider2NewValue = 100 - (newValue + slider1NewValue);

      setFormData((prevData) => ({
        ...prevData,
        [name]: newValue,
        [slider1]: slider1NewValue,
        [slider2]: slider2NewValue,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: newValue,
      }));
    }

    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/job-posting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message || "Failed to create job posting.");
      }

      const data = await response.json();
      setMessage(data.message);
      setTimeout(() => {
        navigate("/hr-dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
      navigate("/");
      setMessage("");
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

        {/* Text Inputs for Skills */}
        <input
          type="text"
          name="primary_skills_name"
          value={formData.primary_skills_name}
          onChange={handleChange}
          placeholder="Primary Skills (e.g., JavaScript, React)"
          style={styles.input}
          required
        />
        <input
          type="text"
          name="secondary_skills_name"
          value={formData.secondary_skills_name}
          onChange={handleChange}
          placeholder="Secondary Skills (e.g., Node.js, Python)"
          style={styles.input}
        />
        <input
          type="text"
          name="other_skills_name"
          value={formData.other_skills_name}
          onChange={handleChange}
          placeholder="Other Skills (e.g., Communication, Problem-Solving)"
          style={styles.input}
        />

        {/* Sliders for Weightages */}
        <div style={styles.sliderContainer}>
          <label>Primary Skills Weightage: {formData.pri_skills_wt}%</label>
          <input
            type="range"
            name="pri_skills_wt"
            min="0"
            max="100"
            value={formData.pri_skills_wt}
            onChange={handleSliderChange}
            style={styles.slider}
          />
        </div>
        <div style={styles.sliderContainer}>
          <label>Secondary Skills Weightage: {formData.sec_skills_wt}%</label>
          <input
            type="range"
            name="sec_skills_wt"
            min="0"
            max="100"
            value={formData.sec_skills_wt}
            onChange={handleSliderChange}
            style={styles.slider}
          />
        </div>
        <div style={styles.sliderContainer}>
          <label>Other Skills Weightage: {formData.oth_skills_wt}%</label>
          <input
            type="range"
            name="oth_skills_wt"
            min="0"
            max="100"
            value={formData.oth_skills_wt}
            onChange={handleSliderChange}
            style={styles.slider}
          />
        </div>

        <input
          type="text"
          name="package"
          value={formData.package}
          onChange={handleChange}
          placeholder="Package in LPA"
          style={styles.input}
          required
        />
        <input
          type="text"
          name="stipend_amount"
          value={formData.stipend_amount}
          onChange={handleChange}
          placeholder="Stipend Amount (for interns)"
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Create Job Posting
        </button>
      </form>
      {message && <div style={styles.successMessage}>{message}</div>}
      {error && <div style={styles.errorMessage}>Error: {error}</div>}
    </div>
  );
}






// Add the same `styles` object from before for styling, but enhance toggle buttons' appearance.




const styles = {
  container: {
    maxWidth: '650px',
    margin: '40px auto',
    padding: '30px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    borderRadius: '12px',
    fontFamily: "'Roboto', sans-serif"
  },
  heading: {
    textAlign: 'center',
    color: '#4A4A4A',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '25px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  input: {
    width: '100%',
    padding: '14px',
    marginBottom: '10px',
    border: '1px solid #dcdcdc',
    borderRadius: '6px',
    fontSize: '16px',
    backgroundColor: '#FAFAFA',
    transition: 'border-color 0.3s',
    outline: 'none',
    ':focus': {
      borderColor: '#007BFF',
    },
  },
  textarea: {
    width: '100%',
    padding: '14px',
    marginBottom: '15px',
    border: '1px solid #dcdcdc',
    borderRadius: '6px',
    fontSize: '16px',
    backgroundColor: '#FAFAFA',
    minHeight: '120px',
    resize: 'vertical',
    transition: 'border-color 0.3s',
    outline: 'none',
    ':focus': {
      borderColor: '#007BFF',
    },
  },
  sliderContainer: {
    marginBottom: '20px',
    textAlign: 'left',
  },
  slider: {
    width: '100%',
    appearance: 'none',
    height: '6px',
    background: '#e0e0e0',
    outline: 'none',
    borderRadius: '5px',
    transition: 'background-color 0.3s',
    cursor: 'pointer',
    '::-webkit-slider-thumb': {
      appearance: 'none',
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      background: '#007BFF',
      cursor: 'pointer',
    },
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  toggleLabel: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#4A4A4A',
  },
  button: {
    padding: '12px 20px',
    backgroundColor: '#007BFF',
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'background-color 0.3s ease',
    ':hover': {
      backgroundColor: '#0056b3',
    },
  },
  successMessage: {
    color: '#28A745',
    fontSize: '16px',
    fontWeight: '500',
    marginTop: '20px',
    textAlign: 'center',
  },
  errorMessage: {
    color: '#DC3545',
    fontSize: '16px',
    fontWeight: '500',
    marginTop: '20px',
    textAlign: 'center',
  }
};


export default JobPosting;