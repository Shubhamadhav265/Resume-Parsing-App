import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'; 
import UploadResume from './UploadResume';  
import JobPosting from './JobPosting';       
// import './App.css'; // Optional: Import CSS for styling

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Recruitment Portal</h1>
        <nav>
          <ul>
            <li>
              <Link to="/">Upload Resume</Link> 
            </li>
            <li>
              <Link to="/job-posting">Create Job Posting</Link> 
            </li>
          </ul>
        </nav>
        <div className="container">
          <Routes>
            <Route path="/" element={<UploadResume />} /> 
            <Route path="/job-posting" element={<JobPosting />} /> 
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
