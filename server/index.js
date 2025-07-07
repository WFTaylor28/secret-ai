
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { OpenAI } = require("openai");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from client folder (React app)
app.use(express.static(path.resolve(__dirname, "../client")));

// OpenAI Setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /chat endpoint
app.post("/chat", async (req, res) => {
  const { message, character } = req.body;

  if (!message || !character) {
    return res.status(400).json({ error: "Missing message or character" });
  }

  try {
    const prompt = `You are ${character.name}, ${character.description}. ${
      character.nsfw ? "You can be bold and expressive." : "Keep your tone friendly."
    }\n\nUser: ${message}\n${character.name}:`;

    const response = await openai.completions.create({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 150,
      temperature: 0.7,
    });
    const aiMessage = response.choices[0].text.trim();
    res.json({ reply: aiMessage });
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

// All other GET requests not handled before will go to React app
app.get("*", (req, res) =>
  res.sendFile(path.resolve(__dirname, "../client", "index.html"))
);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
