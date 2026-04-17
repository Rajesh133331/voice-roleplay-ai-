require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db.cjs");
const crypto = require("crypto");

const uuidv4 = () => crypto.randomUUID();
const Anthropic = require("@anthropic-ai/sdk"); 

const path = require("path");

app.use(express.static(path.join(__dirname, "../dist")));


app.use(cors());
app.use(express.json());

const ai = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});




//creating the session id to track the chat
app.get("/session", async (req, res) => {
  const id = uuidv4();

  try {
    await pool.query("insert into sessions (id) values ($1)", [id]);
    res.json({ sessionId: id });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "session error" });
  }
});

// conversation chat route
app.post("/chat", async (req, res) => {
  const { text, sessionId } = req.body;

  if (!text || !sessionId) {
    return res.json({ reply: "invalid request" });
  }

  try {
    await pool.query(
      "insert into messages (session_id, role, content) values ($1, $2, $3)",
      [sessionId, "user", text],
    );

    const result = await pool.query(
      "select role, content from messages where session_id = $1 order by created_at desc limit 10",
      [sessionId],
    );

    const rows = result.rows.reverse();

    const history = rows.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: [{ type: "text", text: msg.content }],
    }));

    const response = await ai.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 80,

      system: `
You are Rahul Mehta, a telecom customer.

Your phone was stolen today. You need a SIM replacement urgently.

Rules:
- Speak like a normal person
- Max 2 short sentences
- No formal or chatbot language
- Stay focused on SIM issue
- If denied service, say you'll go elsewhere
`.trim(),

      messages: history,
    });

    let reply = response.content[0].text.trim();
    reply = reply.replace(/\*.*?\*/g, "").trim();

    await pool.query(
      "insert into messages (session_id, role, content) values ($1, $2, $3)",
      [sessionId, "assistant", reply],
    );

    res.json({ reply });
  } catch (err) {
    console.log(err.message);
    res.json({ reply: "something went wrong" });
  }
});


app.get("/messages/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const result = await pool.query(
      "select role, content from messages where session_id = $1 order by created_at asc",
      [sessionId],
    );

    const formatted = result.rows.map((m) => ({
      from: m.role === "user" ? "user" : "ai",
      text: m.content,
    }));

    res.json(formatted);
  } catch {
    res.json([]);
  }
});

// scoring the conversation
app.post("/end-session", async (req, res) => {
  const { sessionId } = req.body;

  try {
    const result = await pool.query(
      "select role, content from messages where session_id = $1 order by created_at asc",
      [sessionId],
    );

    let conversation = "";

    result.rows.forEach((m) => {
      if (m.role === "user") {
        conversation += `Executive: ${m.content}\n`;
      } else {
        conversation += `Customer: ${m.content}\n`;
      }
    });

    const response = await ai.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 200,

      system: `
Evaluate the store executive.

Return JSON only:
{
  "score": number (0-10),
  "feedback": "short feedback"
}
`,

      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: conversation,
            },
          ],
        },
      ],
    });

    let text = response.content[0].text.trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { score: 5, feedback: "Average performance" };
    }

    res.json(parsed);
  } catch {
    res.json({ score:0, feedback: "No information is provided to give feedback" });
  }
});

const distPath = path.join(__dirname, "../dist");

app.use(express.static(distPath));

app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("server running on " + PORT);
});
