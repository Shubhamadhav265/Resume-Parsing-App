import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const styles = {
    landingPage: {
      height: "100vh",
      display: "flex",
      flexDirection: "column",
    },
    notificationBar: {
      backgroundColor: "#f5a623",
      padding: "15px",
      textAlign: "center",
      fontSize: "1.2em",
      color: "white",
    },
    content: {
      display: "flex",
      flex: 1,
      justifyContent: "space-between",
    },
    section: {
      width: "50%",
      position: "relative",
    },
    imageContainer: {
      position: "relative",
      width: "100%",
      height: "100%",
    },
    backgroundImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    overlay: {
      position: "absolute",
      top: "20%",
      left: "10%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      color: "white",
      padding: "20px",
      textAlign: "center",
      borderRadius: "10px",
    },
    heading: {
      marginBottom: "20px",
    },
    button: {
      margin: "10px",
      padding: "10px 20px",
      backgroundColor: "#4CAF50",
      color: "white",
      border: "none",
      cursor: "pointer",
      borderRadius: "5px",
      fontSize: "1em",
    },
  };

  return (
    <div style={styles.landingPage}>
      <div style={styles.notificationBar}>
        <p>
          Welcome to the Resume Screening App. Sign up or Login to get started!
        </p>
      </div>

      <div style={styles.content}>
        {/* Left Side: Student Section */}
        <div style={styles.section}>
          <div style={styles.imageContainer}>
            <img
              src="student_image.jpg"
              alt="Student"
              style={styles.backgroundImage}
            />
            <div style={styles.overlay}>
              <h2 style={styles.heading}>For Students</h2>
              <button
                style={styles.button}
                onClick={() => navigate("/candidate-signup")}
              >
                Student Signup
              </button>
              <button
                style={styles.button}
                onClick={() => navigate("/candidate-signin")}
              >
                Student Login
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: HR Section */}
        <div style={styles.section}>
          <div style={styles.imageContainer}>
            <img src="hr_image.jpg" alt="HR" style={styles.backgroundImage} />
            <div style={styles.overlay}>
              <h2 style={styles.heading}>For HR</h2>
              <button
                style={styles.button}
                onClick={() => navigate("/hr-signup")}
              >
                HR Signup
              </button>
              <button
                style={styles.button}
                onClick={() => navigate("/hr-signin")}
              >
                HR Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
