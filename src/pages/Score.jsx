import { useNavigate } from "react-router-dom";

export default function Score() {
  const navigate = useNavigate();

  const score = localStorage.getItem("score");
  const feedback = localStorage.getItem("feedback");

  const startAgain = () => {
    localStorage.removeItem("sessionId");
    navigate("/");
  };

  const exit = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>Session Result</h2>

        <div style={styles.score}>Score: {score} / 10</div>

        <p style={styles.feedback}>{feedback}</p>

        <div style={styles.buttons}>
          <button style={styles.start} onClick={startAgain}>
            Start Again
          </button>

          <button style={styles.exit} onClick={exit}>
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f7f7f7",
    fontFamily: "system-ui",
  },

  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    width: "400px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },

  score: {
    fontSize: "28px",
    fontWeight: "bold",
    margin: "20px 0",
  },

  feedback: {
    color: "#555",
    marginBottom: "20px",
  },

  buttons: {
    display: "flex",
    gap: "10px",
  },

  start: {
    flex: 1,
    padding: "12px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  exit: {
    flex: 1,
    padding: "12px",
    background: "#e11d48",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
