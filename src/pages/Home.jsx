import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../utils/api";

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const start = async () => {
  if (loading) return; // prevent multiple clicks

  setLoading(true);

  try {
    const res = await api.get("/session");
    localStorage.setItem("sessionId", res.data.sessionId);
    navigate("/play");
  } catch {
    alert("unable to start");
    setLoading(false);
};

  return (
    <div style={styles.wrapper} className="home-wrapper">
      {/* LEFT */}
      <div style={styles.left}>
        <h1 style={styles.heading}>Voice Assessment</h1>

        <p style={styles.sub}>
          Practice handling real customer situations using voice interaction.
        </p>

        <button
  style={{
    ...styles.button,
    background: loading ? "#777" : "#000",
    cursor: loading ? "not-allowed" : "pointer",
  }}
  onClick={start}
  disabled={loading}
>
  {loading ? "Starting..." : "Start Session"}
</button>
      </div>

      {/* RIGHT */}
      <div style={styles.right}>
        <div style={styles.card}>
          <h3>Situation</h3>

          <p style={styles.text}>
            A customer enters your telecom store. His phone was stolen this
            morning. He needs a SIM replacement immediately.
          </p>

          <div style={styles.people}>
            <div>
              <p style={styles.label}>Customer</p>
              <h4>Rahul Mehta</h4>
            </div>

            <div>
              <p style={styles.label}>Your Role</p>
              <h4>Store Executive</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    height: "100vh",
    fontFamily: "system-ui, sans-serif",
  },

  left: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "60px",
  },

  right: {
    flex: 1,
    background: "#f6f7f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },

  card: {
    maxWidth: "420px",
  },

  heading: {
    fontSize: "40px",
    marginBottom: "10px",
  },

  sub: {
    color: "#555",
    marginBottom: "30px",
    maxWidth: "400px",
  },

  button: {
    width: "220px",
    padding: "14px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  text: {
    color: "#555",
    marginBottom: "20px",
  },

  people: {
    display: "flex",
    gap: "40px",
  },

  label: {
    fontSize: "12px",
    color: "#777",
    marginBottom: "5px",
  },
};
