import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const StudentRankings = () => {
  const { job_id } = useParams(); // Get job_id from URL parameters
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [numCandidates, setNumCandidates] = useState(0); // State for the number of candidates
  const [isShortlisted, setIsShortlisted] = useState(false); // State to track if shortlisting is done

  useEffect(() => {
    console.log("Job ID:", job_id); // Debugging job_id

    const fetchRankings = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/student-rankings/${job_id}`,
          {
            withCredentials: true,
          }
        );
        console.log("API Response:", response.data); // Debugging response data

        // Transform the array of arrays into array of objects
        const transformedData = response.data.map((student) => ({
          sr_no: student[0],
          full_name: student[1],
          college_name: student[2],
          email_id: student[3],
          score: student[4],
          status: student[5], // Status from Applications table
        }));

        setStudents(transformedData);
        setLoading(false);

        // Check if any candidate has already been shortlisted
        const alreadyShortlisted = transformedData.some(
          (student) => student.status === "shortlisted"
        );
        setIsShortlisted(alreadyShortlisted);
      } catch (error) {
        console.error("Error fetching student rankings:", error);
        setLoading(false);
      }
    };

    fetchRankings();
  }, [job_id]);

  // Function to handle shortlisting of students
  const handleShortlist = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/shortlist-students/${job_id}`,
        { numCandidates },
        { withCredentials: true }
      );
      console.log("Shortlist Response:", response.data);

      // Fetch the updated rankings after shortlisting
      setIsShortlisted(true); // Disable the shortlisting after successful call
    } catch (error) {
      console.error("Error during shortlisting:", error);
    }
  };

  // Inline styles for the table and container
  const containerStyle = {
    width: "80%",
    margin: "20px auto",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    margin: "20px 0",
    fontSize: "16px",
    textAlign: "left",
  };

  const thTdStyle = {
    padding: "12px",
    border: "1px solid #ddd",
  };

  const thStyle = {
    ...thTdStyle,
    backgroundColor: "#4CAF50",
    color: "white",
  };

  const trEvenStyle = {
    backgroundColor: "#f9f9f9",
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center", color: "#333" }}>Student Rankings</h2>
      {loading ? (
        <p>Loading...</p>
      ) : students.length === 0 ? (
        <p>No students have applied for this job yet.</p>
      ) : (
        <div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Sr. No</th>
                <th style={thStyle}>Full Name</th>
                <th style={thStyle}>College Name</th>
                <th style={thStyle}>Email ID</th>
                <th style={thStyle}>Score</th>
                <th style={thStyle}>Status</th> {/* New Status column */}
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index} style={index % 2 === 0 ? trEvenStyle : {}}>
                  <td style={thTdStyle}>{student.sr_no}</td>
                  <td style={thTdStyle}>{student.full_name}</td>
                  <td style={thTdStyle}>{student.college_name}</td>
                  <td style={thTdStyle}>{student.email_id}</td>
                  <td style={thTdStyle}>{student.score}</td>
                  <td style={thTdStyle}>{student.status}</td>{" "}
                  {/* Display the candidate status */}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Shortlisting form */}
          {!isShortlisted /* Disable shortlisting button after it's done */ && (
            <div>
              <label>
                Enter number of candidates to shortlist:{" "}
                <select
                  value={numCandidates}
                  onChange={(e) => setNumCandidates(e.target.value)}
                >
                  <option value={0}>Select number</option>
                  {[...Array(50).keys()].map((num) => (
                    <option key={num + 1} value={num + 1}>
                      {num + 1}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={handleShortlist}
                style={{
                  marginLeft: "10px",
                  padding: "10px 20px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                disabled={
                  numCandidates === 0 || students.length < numCandidates
                }
              >
                Shortlist
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentRankings;
