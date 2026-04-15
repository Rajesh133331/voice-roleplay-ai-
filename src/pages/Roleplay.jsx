import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Roleplay() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [time, setTime] = useState(0);
  const [ended, setEnded] = useState(false);
  const [result, setResult] = useState(null);

  const navigate = useNavigate();
  const sessionId = localStorage.getItem("sessionId");
  const chatRef = useRef(null);

  // timer
  useEffect(() => {
    const t = setInterval(() => {
      setTime((p) => p + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // load messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await api.get(`/messages/${sessionId}`);
        setMessages(res.data);
      } catch {
        console.log("failed to load messages");
      }
    };

    if (sessionId) {
      loadMessages();
    }
  }, [sessionId]);

  // scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

 const speak = () => {
   if (ended) return;

   // ✅ 1. check browser support FIRST
   if (
     !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
   ) {
     alert("Speech not supported in this browser");
     return;
   }

   const SpeechRecognition =
     window.SpeechRecognition || window.webkitSpeechRecognition;

   const recognition = new SpeechRecognition();
   recognition.lang = "en-IN";

   // ✅ 2. handle mic permission / errors
   recognition.onerror = (e) => {
     if (e.error === "not-allowed") {
       alert("Please allow microphone access");
     } else {
       alert("Mic error: " + e.error);
     }
   };

   recognition.onresult = async (e) => {
     const result = e.results[0][0].transcript;

     setText(result);

     setMessages((prev) => [...prev, { from: "user", text: result }]);

     try {
       const res = await api.post("/chat", { text: result, sessionId });

       const reply = res.data.reply;

       setMessages((prev) => [...prev, { from: "ai", text: reply }]);

       const voice = new SpeechSynthesisUtterance(reply);
       speechSynthesis.speak(voice);
     } catch {
       console.log("chat failed");
     }
   };

   recognition.start();
 };

  const end = async () => {
    if (ended) return;

    try {
      const res = await api.post("/end-session", { sessionId });

      speechSynthesis.cancel();

      setResult(res.data); // store score + feedback
      setEnded(true); // switch UI
    } catch {
      console.log("end failed");
    }
  };

  const startAgain = async () => {
    try {
      const res = await api.get("/session");

      localStorage.setItem("sessionId", res.data.sessionId);

      window.location.reload(); // clean restart
    } catch {
      console.log("restart failed");
    }
  };

  const exit = () => {
    localStorage.removeItem("sessionId");
    navigate("/");
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2>Conversation</h2>
        <span>{time}s</span>
      </div>

      <div ref={chatRef} style={styles.chat}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={m.from === "user" ? styles.userRow : styles.aiRow}
          >
            <div
              style={m.from === "user" ? styles.userBubble : styles.aiBubble}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.bottom}>
        {!ended ? (
          <>
            <div style={styles.input}>{text || "Tap mic and speak..."}</div>

            <div style={styles.buttons}>
              <button style={styles.mic} onClick={speak}>
                🎤 Speak
              </button>

              <button style={styles.end} onClick={end}>
                End Session
              </button>
            </div>
          </>
        ) : (
          <div style={styles.resultBox}>
            <h3>Session Completed</h3>

            <p style={styles.score}>Score: {result?.score} / 10</p>

            <p style={styles.feedback}>{result?.feedback}</p>

            <div style={styles.buttons}>
              <button style={styles.mic} onClick={startAgain}>
                Start Again
              </button>

              <button style={styles.end} onClick={exit}>
                Exit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f7f7f7",
    fontFamily: "system-ui",
  },

  header: {
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #ddd",
  },

  chat: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
  },

  userRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "10px",
  },

  aiRow: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "10px",
  },

  userBubble: {
    background: "#111",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "16px",
    maxWidth: "60%",
  },

  aiBubble: {
    background: "#e5e7eb",
    padding: "10px 14px",
    borderRadius: "16px",
    maxWidth: "60%",
  },

  bottom: {
    padding: "16px",
    borderTop: "1px solid #ddd",
    background: "#fff",
  },

  input: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginBottom: "10px",
    color: "#555",
  },

  resultBox: {
    textAlign: "center",
  },

  score: {
    fontSize: "22px",
    fontWeight: "bold",
    margin: "10px 0",
  },

  feedback: {
    color: "#555",
    marginBottom: "15px",
  },

  buttons: {
    display: "flex",
    gap: "10px",
  },

  mic: {
    flex: 1,
    padding: "12px",
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  end: {
    flex: 1,
    padding: "12px",
    background: "#e11d48",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
