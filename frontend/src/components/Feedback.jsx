import React from "react";

const Feedback = ({ feedback, onClose }) => {
    return (
        <div style={styles.modal}>
            <div style={styles.modalContent}>
                <h4>Feedback for Job</h4>
                <br />      
                <p>{feedback}</p>
                <br />
                <button onClick={onClose} style={styles.closeModalButton}>
                    Close
                </button>
            </div>
        </div>
    );
};

// Define styles here...
const styles = {
    modal: {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        textAlign: "center",
    },
    closeModalButton: {
        padding: "10px 20px",
        backgroundColor: "#dc3545",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
};

export default Feedback;
