require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI Setup
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 150,
      temperature: 0.7,
    });

    const aiMessage = response.data.choices[0].text.trim();
    res.json({ reply: aiMessage });
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
