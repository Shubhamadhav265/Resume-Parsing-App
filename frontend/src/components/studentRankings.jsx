import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./studentRankings.css"; // Assuming the CSS is in the same directory or you can define it here.

const StudentRankings = () => {
  const { job_id } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [numCandidates, setNumCandidates] = useState(0);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/student-rankings/${job_id}`,
          { withCredentials: true }
        );
        const transformedData = response.data.map((student) => ({
          sr_no: student[0],
          full_name: student[1],
          college_name: student[2],
          email_id: student[3],
          score: student[4],
          status: student[5],
        }));
        setStudents(transformedData);
        setLoading(false);
        const alreadyShortlisted = transformedData.some(
          (student) => student.status === "shortlisted"
        );
        setIsShortlisted(alreadyShortlisted);
      } catch (error) {
        console.error("Error fetching student rankings:", error);
        setError("Failed to load student rankings.");
        setLoading(false);
      }
    };

    fetchRankings();
  }, [job_id]);

  const handleShortlist = async () => {
    if (numCandidates <= 0) return;
    try {
      await axios.post(
        `http://localhost:5000/shortlist-students/${job_id}`,
        { numCandidates },
        { withCredentials: true }
      );
      setIsShortlisted(true);
    } catch (error) {
      console.error("Error during shortlisting:", error);
      setError("Error while shortlisting students.");
    }
  };

  return (
    <div className="student-rankings-container">
      <h2 className="heading">Student Rankings</h2>
      {loading ? (
        <div className="loader">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : students.length === 0 ? (
        <p>No students have applied for this job yet.</p>
      ) : (
        <div>
          <table className="student-table">
            <thead>
              <tr>
                <th>Sr. No</th>
                <th>Full Name</th>
                <th>College Name</th>
                <th>Email ID</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.sr_no} className={index % 2 === 0 ? "even-row" : ""}>
                  <td>{student.sr_no}</td>
                  <td>{student.full_name}</td>
                  <td>{student.college_name}</td>
                  <td>{student.email_id}</td>
                  <td>{student.score}</td>
                  <td>{student.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {!isShortlisted && (
            <div className="shortlist-form">
              <label>
                Enter number of candidates to shortlist:
                <select
                  value={numCandidates}
                  onChange={(e) => setNumCandidates(Number(e.target.value))}
                  className="candidate-select"
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
                className="shortlist-button"
                disabled={numCandidates === 0 || numCandidates > students.length}
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
