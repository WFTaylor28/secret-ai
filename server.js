const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/api/chat', async (req, res) => {
  const { prompt } = req.body;

  try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 150
    });

    res.json({ reply: completion.data.choices[0].text.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
