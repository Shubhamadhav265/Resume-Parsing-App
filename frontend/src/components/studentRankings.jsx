import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const StudentRankings = () => {
  const { job_id } = useParams(); // Get job_id from URL parameters
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Job ID:", job_id); // Debugging job_id

    const fetchRankings = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/student-rankings/${job_id}`, {
          withCredentials: true,
        });
        console.log("API Response:", response.data); // Debugging response data

        // Transform the array of arrays into array of objects
        const transformedData = response.data.map((student) => ({
          sr_no: student[0],
          full_name: student[1],
          college_name: student[2],
          email_id: student[3],
          score: student[4],
        }));

        setStudents(transformedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching student rankings:", error);
        setLoading(false);
      }
    };

    fetchRankings();
  }, [job_id]);

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

  const trHoverStyle = {
    ":hover": {
      backgroundColor: "#f1f1f1",
    },
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center", color: "#333" }}>Student Rankings</h2>
      {loading ? (
        <p>Loading...</p>
      ) : students.length === 0 ? (
        <p>No students have applied for this job yet.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Sr. No</th>
              <th style={thStyle}>Full Name</th>
              <th style={thStyle}>College Name</th>
              <th style={thStyle}>Email ID</th>
              <th style={thStyle}>Score</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentRankings;
