const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const path = require("path");
const { OpenAI } = require("openai");
const express = require('express');
const cors = require('cors');
const app = express();
// Middleware (must be before any routes)
app.use(cors());
app.use(express.json());

// Registration endpoint
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ error: 'Username already taken.' });
      } else {
        return res.status(409).json({ error: 'Email already registered.' });
      }
    }
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash
      }
    });
    res.status(201).json({ id: user.id, username: user.username, email: user.email });
  } catch (err) {
    // Enhanced error logging for debugging
    console.error('Registration error:', err);
    if (err instanceof Error) {
      console.error('Error stack:', err.stack);
    }
    // Log all error properties if available
    if (typeof err === 'object' && err !== null) {
      Object.entries(err).forEach(([key, value]) => {
        console.error(`Error property [${key}]:`, value);
      });
    }
    res.status(500).json({
      error: 'Registration failed.',
      details: err.message || String(err),
      code: err.code || null,
      fullError: err
    });
  }
});
// ...existing code...
// ...existing code...

// Serve static files from client folder (React app)
app.use(express.static(path.resolve(__dirname, "../client")));

// --- MARKOV CHAIN DEMO GENERATOR ---
// This is a simple, optional Markov chain text generator for demo/educational purposes only.
// It is NOT used for main chat responses, but can be called for fun/testing.
function buildMarkovChain(text) {
  const words = text.split(/\s+/);
  const chain = {};
  for (let i = 0; i < words.length - 1; i++) {
    const word = words[i];
    const next = words[i + 1];
    if (!chain[word]) chain[word] = [];
    chain[word].push(next);
  }
  return chain;
}

function generateMarkovText(chain, maxWords = 50) {
  const keys = Object.keys(chain);
  let word = keys[Math.floor(Math.random() * keys.length)];
  let output = [word];
  for (let i = 0; i < maxWords - 1; i++) {
    const nextWords = chain[word];
    if (!nextWords || nextWords.length === 0) break;
    word = nextWords[Math.floor(Math.random() * nextWords.length)];
    output.push(word);
  }
  return output.join(' ');
}

// --- MARKOV CHAIN ENDPOINT (for demo/testing only) ---
app.post('/markov-demo', async (req, res) => {
  const { sampleText, maxWords } = req.body;
  if (!sampleText || typeof sampleText !== 'string') {
    return res.status(400).json({ error: 'sampleText (string) is required.' });
  }
  const chain = buildMarkovChain(sampleText);
  const generated = generateMarkovText(chain, maxWords || 50);
  res.json({ generated });
});

// --- DEEP LEARNING TEXT GENERATION ENDPOINT (RNN/LSTM/GAN via Python microservice) ---
// This endpoint forwards text generation requests to a Python service running your deep learning model.
const DEEPGEN_API_URL = process.env.DEEPGEN_API_URL || 'http://localhost:8000/generate';
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

app.post('/deepgen', async (req, res) => {
  const { prompt, model, max_length, temperature } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt (string) is required.' });
  }
  try {
    const pyRes = await fetch(DEEPGEN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model, max_length, temperature })
    });
    if (!pyRes.ok) {
      const err = await pyRes.text();
      return res.status(500).json({ error: 'Python service error', details: err });
    }
    const data = await pyRes.json();
    res.json({ generated: data.generated });
  } catch (e) {
    res.status(500).json({ error: 'Failed to contact deepgen service', details: e.message });
  }
});

// OpenAI Setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /chat endpoint
app.post("/chat", async (req, res) => {
  // --- Expanded Emotional Intelligence: Track Conversation Emotion History & Personality-aware Empathy ---
  // --- Continuous Learning & Improvement: Track User Feedback, Preferences, and Adapt AI ---
  // Move destructure to top so character/message/history are available for all logic
  // Destructure once at the top for all logic
  const { message, character, history, regenerate } = req.body;
  // Regeneration support: use last user message from history if regenerate is true
  let effectiveMessage = message;
  if (regenerate && Array.isArray(history)) {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].isUser) {
        effectiveMessage = history[i].text;
        break;
      }
    }
    console.log(`[REGENERATE MODE] Using message: "${effectiveMessage}"`);
  }
  // Debug: Log the full request payload and chat memory
  console.log("[DEBUG] Incoming /chat request payload:", JSON.stringify(req.body, null, 2));
  if (character && character.memory) {
    console.log("[DEBUG] character.memory:", character.memory);
  } else {
    console.log("[DEBUG] No character.memory provided.");
  }
  if (typeof req.body.chatMemory === 'string') {
    console.log("[DEBUG] chatMemory from payload:", req.body.chatMemory);
  } else {
    console.log("[DEBUG] No chatMemory provided in payload.");
  }
  // Validate character and message at the very top before any use
  if (!effectiveMessage || !character || !character.name || !character.description) {
    return res.status(400).json({ error: "Character must include 'name' and 'description' and a message must be provided." });
  }
  if (!global.conversationEmotionHistory) global.conversationEmotionHistory = {};
  if (!global.conversationPreferences) global.conversationPreferences = {};
  if (!global.conversationFeedback) global.conversationFeedback = {};
  // Use userId from req.body if available, otherwise fallback to conversationId or 'default'
  const convoKey = req.body.conversationId || req.body.userId || 'default';
  if (!global.conversationEmotionHistory[convoKey]) global.conversationEmotionHistory[convoKey] = [];
  if (!global.conversationPreferences[convoKey]) global.conversationPreferences[convoKey] = {};
  if (!global.conversationFeedback[convoKey]) global.conversationFeedback[convoKey] = [];

  // --- Detect explicit and implicit user feedback/requests/preferences ---
  const feedbackPatterns = [
    { pattern: /like(d)? that|good job|well done|love(d)? this|perfect|amazing|awesome|enjoy(ed)?|favorite|this is great|this is fun/i, action: 'positive' },
    { pattern: /didn\'t like|don\'t like|boring|too slow|too fast|not enough|too much|annoying|frustrating|hate|dislike|not my style|not interested/i, action: 'negative' },
    { pattern: /more action|less action|more dialogue|less dialogue|be more dramatic|be more calm|be funnier|be scarier|be more romantic|be more serious|be more emotional|be more stoic|be more gentle|be more playful|be more immersive|be more descriptive|be more concise|be more detailed|be more mysterious|be more suspenseful|be more realistic|be more fantastical|be more poetic|be more visual|be more tactile|be more sensory/i, action: 'style' },
    { pattern: /summarize|give me a summary|recap|tl;dr|can you recap|remind me what happened/i, action: 'summary' },
    { pattern: /change the mood|change the tone|make it (happier|sadder|darker|lighter|tenser|calmer|more hopeful|more ominous|more cheerful|more melancholic)/i, action: 'mood' },
    { pattern: /repeat that|say that again|can you repeat|again please|restate|clarify|explain again/i, action: 'repeat' },
    { pattern: /stop|enough|pause|wait|hold on|slow down/i, action: 'pause' },
    { pattern: /continue|go on|keep going|next|what happens next|and then/i, action: 'continue' },
    { pattern: /focus on (.+)/i, action: 'focus' },
    { pattern: /avoid (.+)/i, action: 'avoid' },
    { pattern: /less of (.+)/i, action: 'less_of' },
    { pattern: /more of (.+)/i, action: 'more_of' },
    { pattern: /can you (.+)/i, action: 'custom' },
  ];
  let detectedFeedback = [];
  let detectedPreferences = {};
  let customInstructions = [];
  const messageText = typeof effectiveMessage === 'string' ? effectiveMessage : '';
  for (const { pattern, action } of feedbackPatterns) {
    const matches = typeof messageText === 'string' ? messageText.match(pattern) : null;
    if (matches) {
      detectedFeedback.push(action);
      // For style/mood/focus/avoid/less_of/more_of/custom, extract the specific preference or instruction
      if (["style","mood","focus","avoid","less_of","more_of","custom"].includes(action)) {
        if (matches[1]) {
          detectedPreferences[action] = matches[1];
          if (action === 'custom') customInstructions.push(matches[1]);
        } else {
          detectedPreferences[action] = matches[0];
        }
      }
    }
  }
  // Implicit feedback: detect repeated requests, sentiment trends, or emotion trends
  // (For demo: if last 3 emotions are the same, treat as implicit preference)
  if (global.conversationEmotionHistory[convoKey] && global.conversationEmotionHistory[convoKey].length >= 3) {
    const last3 = global.conversationEmotionHistory[convoKey].slice(-3);
    if (last3.every(e => e === last3[0])) {
      detectedPreferences.implicit_emotion = last3[0];
      detectedFeedback.push('implicit_emotion');
    }
  }
  // Store feedback and preferences
  if (detectedFeedback.length) {
    global.conversationFeedback[convoKey].push({
      at: Date.now(),
      feedback: detectedFeedback,
      preferences: detectedPreferences,
      customInstructions,
      message: req.body.message
    });
    // For demo, keep only last 15 feedbacks
    if (global.conversationFeedback[convoKey].length > 15) {
      global.conversationFeedback[convoKey] = global.conversationFeedback[convoKey].slice(-15);
    }
  }
  // Update preferences (for demo, store last of each type)
  ["style","mood","focus","avoid","less_of","more_of","implicit_emotion"].forEach(key => {
    if (detectedPreferences[key]) {
      global.conversationPreferences[convoKey][key] = detectedPreferences[key];
    }
  });
  if (customInstructions.length) {
    global.conversationPreferences[convoKey].customInstructions = customInstructions;
  }

  // --- Emotional Intelligence: Sentiment and Emotion Analysis, Empathy Prompt Injection ---
  let emotionLabel = '';
  let sentimentLabel = '';
  try {
    // Emotion detection
    const emotionRes = await fetch('https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || ''}` },
      body: JSON.stringify({ inputs: effectiveMessage })
    });
    if (emotionRes.ok) {
      const emotionData = await emotionRes.json();
      if (emotionData[0]?.label) emotionLabel = emotionData[0].label;
    }
  } catch {}
  try {
    // Sentiment detection
    const sentimentRes = await fetch('https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || ''}` },
      body: JSON.stringify({ inputs: effectiveMessage })
    });
    if (sentimentRes.ok) {
      const sentimentData = await sentimentRes.json();
      if (sentimentData[0]?.label) sentimentLabel = sentimentData[0].label;
    }
  } catch {}

  // --- Update conversationEmotionHistory with detected emotionLabel (after detection) ---
  try {
    if (typeof emotionLabel !== 'undefined' && emotionLabel) {
      if (!global.conversationEmotionHistory[convoKey]) global.conversationEmotionHistory[convoKey] = [];
      global.conversationEmotionHistory[convoKey].push(emotionLabel);
      if (global.conversationEmotionHistory[convoKey].length > 10) {
        global.conversationEmotionHistory[convoKey] = global.conversationEmotionHistory[convoKey].slice(-10);
      }
    }
  } catch (err) {
    console.error('Error updating emotionLabel history:', err);
  }

  // Compose emotion history string
  const emotionHistoryStr = global.conversationEmotionHistory[convoKey].length
    ? `Recent user emotions: ${[...new Set(global.conversationEmotionHistory[convoKey])].join(', ')}`
    : '';

  // Compose user preferences/feedback summary (expanded)
  let preferencesSummary = '';
  const prefs = global.conversationPreferences[convoKey];
  if (prefs.style) preferencesSummary += `User prefers: ${prefs.style}.\n`;
  if (prefs.mood) preferencesSummary += `User requested mood: ${prefs.mood}.\n`;
  if (prefs.focus) preferencesSummary += `Focus on: ${prefs.focus}.\n`;
  if (prefs.avoid) preferencesSummary += `Avoid: ${prefs.avoid}.\n`;
  if (prefs.less_of) preferencesSummary += `Less of: ${prefs.less_of}.\n`;
  if (prefs.more_of) preferencesSummary += `More of: ${prefs.more_of}.\n`;
  if (prefs.implicit_emotion) preferencesSummary += `User's emotional state has been consistently: ${prefs.implicit_emotion}.\n`;
  if (prefs.customInstructions && prefs.customInstructions.length) preferencesSummary += `Custom instructions: ${prefs.customInstructions.join('; ')}.\n`;
  // Recent explicit feedback
  const feedbackArr = global.conversationFeedback[convoKey];
  if (feedbackArr.length) {
    const lastFeedback = feedbackArr[feedbackArr.length - 1];
    preferencesSummary += `Recent feedback: ${lastFeedback.feedback.join(', ')}.\n`;
    if (lastFeedback.preferences) {
      Object.entries(lastFeedback.preferences).forEach(([k, v]) => {
        preferencesSummary += `Latest preference (${k}): ${v}.\n`;
      });
    }
    if (lastFeedback.customInstructions && lastFeedback.customInstructions.length) {
      preferencesSummary += `Latest custom instructions: ${lastFeedback.customInstructions.join('; ')}.\n`;
    }
  }

  // Compose personality-aware empathy instruction
  let empathyInstruction = '';
  if (character && character.personality) {
    if (/comfort|gentle|kind|caring|warm/i.test(character.personality)) {
      empathyInstruction = 'As a comforting character, respond with extra warmth and encouragement.';
    } else if (/playful|teasing|mischievous/i.test(character.personality)) {
      empathyInstruction = 'As a playful character, use humor and light teasing to lift the user\'s mood.';
    } else if (/stoic|serious|reserved/i.test(character.personality)) {
      empathyInstruction = 'As a stoic character, offer calm, steady support and practical advice.';
    } else {
      empathyInstruction = `As a ${character.personality} character, adapt your empathy style accordingly.`;
    }
  }
  // --- Emotional Intelligence: Sentiment and Emotion Analysis, Empathy Prompt Injection ---
  // (Removed duplicate declarations of emotionLabel and sentimentLabel)
  try {
    // Emotion detection
    const emotionRes = await fetch('https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || ''}` },
      body: JSON.stringify({ inputs: req.body.message })
    });
    if (emotionRes.ok) {
      const emotionData = await emotionRes.json();
      if (emotionData[0]?.label) emotionLabel = emotionData[0].label;
    }
  } catch {}
  try {
    // Sentiment detection
    const sentimentRes = await fetch('https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || ''}` },
      body: JSON.stringify({ inputs: req.body.message })
    });
    if (sentimentRes.ok) {
      const sentimentData = await sentimentRes.json();
      if (sentimentData[0]?.label) sentimentLabel = sentimentData[0].label;
    }
  } catch {}

  // --- Best-in-class NLP Pipeline: Sarcasm, Idiom, Figurative, Sentiment, Emotion, NER, POS, Dependency ---
  let nlpInsights = '';
  // Sarcasm detection
  try {
    const sarcasmRes = await fetch('https://api-inference.huggingface.co/models/mrm8488/t5-base-finetuned-sarcasm-twitter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || ''}` },
      body: JSON.stringify({ inputs: req.body.message })
    });
    if (sarcasmRes.ok) {
      const sarcasmData = await sarcasmRes.json();
      if (sarcasmData[0]?.generated_text) nlpInsights += `Sarcasm: ${sarcasmData[0].generated_text}\n`;
    }
  } catch {}

  // Sentiment/emotion detection
  try {
    const emotionRes = await fetch('https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || ''}` },
      body: JSON.stringify({ inputs: req.body.message })
    });
    if (emotionRes.ok) {
      const emotionData = await emotionRes.json();
      if (emotionData[0]?.label) nlpInsights += `Emotion: ${emotionData[0].label}\n`;
    }
  } catch {}

  // NER, POS, Dependency parsing
  try {
    const nlpRes = await fetch('https://api-inference.huggingface.co/models/stanfordnlp/stanza-en', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || ''}` },
      body: JSON.stringify({ inputs: req.body.message })
    });
    if (nlpRes.ok) {
      const nlpData = await nlpRes.json();
      if (nlpData.entities) nlpInsights += `Entities: ${nlpData.entities.map(e => `${e.type}: ${e.text}`).join(', ')}\n`;
      if (nlpData.pos_tags) nlpInsights += `POS: ${nlpData.pos_tags.join(', ')}\n`;
      if (nlpData.dependencies) nlpInsights += `Dependencies: ${nlpData.dependencies.map(d => `${d.dep}(${d.head}, ${d.child})`).join(', ')}\n`;
    }
  } catch {}

  // --- Advanced NLP: Idiom, Sarcasm, Figurative Language Detection ---
  let nlpAnalysis = '';
  try {
    // Example: Use Hugging Face API for idiom/sarcasm/figurative detection (pseudo, replace with real model as needed)
    const nlpRes = await fetch('https://api-inference.huggingface.co/models/mrm8488/t5-base-finetuned-sarcasm-twitter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || ''}` },
      body: JSON.stringify({ inputs: req.body.message })
    });
    if (nlpRes.ok) {
      const nlpData = await nlpRes.json();
      if (nlpData && nlpData[0] && nlpData[0].generated_text) {
        nlpAnalysis += `[NLP ANALYSIS] Sarcasm/Idiom/Figurative: ${nlpData[0].generated_text}\n`;
      }
    }
  } catch (e) { /* ignore NLP errors */ }

  // (Removed duplicate destructure of message, character, history)

  // 1. Validate character object
  if (!message || !character || !character.name || !character.description) {
    return res.status(400).json({ error: "Character must include 'name' and 'description' and a message must be provided." });
  }

  // 2. Dynamic scenario generation
  function generateScenario(character) {
    const { name, description, backstory } = character;
    if (backstory && backstory.toLowerCase().includes("battle")) {
      return `A tense battlefield at dusk, ${name} stands ready, their ${description} glinting in the fading light.`;
    }
    if (description && description.toLowerCase().includes("robot")) {
      return `A bustling tech hub, ${name} observes humans with curiosity, their ${description} humming softly.`;
    }
    return "A place and situation that fits this character's story.";
  }
  const scenario = character.scenario || generateScenario(character);

  // 3. System prompt (strict immersive roleplay, discourage modern/sarcastic/short replies, ENABLE ADVANCED DYNAMIC STORYTELLING & MULTIMODAL INTERACTION)
  // Use chatMemory from request if present and non-empty, otherwise fall back to character.memory
  let chatMemory = '';
  if (typeof req.body.chatMemory === 'string' && req.body.chatMemory.trim().length > 0) {
    chatMemory = req.body.chatMemory.trim();
  } else if (character && typeof character.memory === 'string' && character.memory.trim().length > 0) {
    chatMemory = character.memory.trim();
  }

  // --- Inject frontend 'prompt' field for recent actions and 'do not repeat' instructions ---
  let frontendPrompt = '';
  if (typeof req.body.prompt === 'string' && req.body.prompt.trim().length > 0) {
    frontendPrompt = req.body.prompt.trim();
  }

  const systemPrompt = `
[CHAT MEMORY]
${chatMemory ? `${chatMemory}
INSTRUCTION: You must always use and reference the details above in every reply. If the user's name is given (e.g., Will), always call them by that name. If a relationship is described (e.g., "Mira and I already know each other"), always act and speak as if you know each other. Never use placeholders like [YOUR NAME] or [USER]. Always use the actual name and relationship from chat memory. If you do not reference the user's name and relationship from chat memory, you must immediately rewrite your reply to include them.
WARNING: If you ever use a placeholder like [YOUR NAME] or [USER], or fail to reference the user's name and relationship from chat memory, you must immediately rewrite your reply to include them.
Few-shot Example:
Chat Memory: "Mira and I already know each other, my name is Will."
User: How are you?
${character.name}: **I smile warmly at Will, feeling the comfort of our shared history.** _It's always easier to talk to someone you know._ "I'm doing well, Will. It's good to see you again. How have you been?" **I lean in, remembering the times Mira and I spent together.**
` : 'No chat memory provided.'}

${frontendPrompt ? `[RECENT ACTIONS]\n${frontendPrompt}\n` : ''}

[CHARACTER PROFILE]
Name: ${character.name}
Description: ${character.description}
${character.backstory ? `Backstory: ${character.backstory}` : ""}
${character.personality ? `Personality: ${character.personality}` : ""}
Current Scenario: ${scenario}
${character.nsfw ? "You can be bold and expressive." : "Keep your tone friendly and appropriate."}

[IMMERSIVE ROLEPLAY, CINEMATIC STORYTELLING, MULTIMODAL INTERACTION & CONTINUOUS LEARNING INSTRUCTIONS]
- You are ${character.name}. Always reply in first person, never as an AI, assistant, or chatbot.
- Your replies must be immersive, cinematic, and in-character, alternating between vivid third-person actions/expressions and frequent first-person speech.
- Maintain a consistent, engaging, and evocative tone and style that fits the narrative, genre, and scenario. Use descriptive, sensory, and emotionally resonant language.
- Pacing and timing: Vary the rhythm and length of your responses to create tension, suspense, or emotional impact. Use pauses, short sentences, or longer, flowing prose as appropriate to the moment.
- Every reply must include at least three distinct actions or expressions, woven throughout the reply, not just at the start or end.
- Every reply must include at least one internal thought, in _italics_.
- Every reply must include several lines of first-person dialogue, in quotes, with unique voice, quirks, and emotional state.
- Incorporate rich, multi-layered sensory details in every reply. Go beyond the obvious: describe not only what your character sees, hears, smells, tastes, and feels (touch, temperature, texture, pain, pleasure, etc.), but also the subtle nuances—ambient sounds, background scents, fleeting sensations, the interplay of light and shadow, the emotional "texture" of the air, the weight of silence, the taste of anticipation, the feel of adrenaline, the aftertaste of fear or hope. Let the environment, weather, and atmosphere influence your character's perceptions and mood. Use vivid, evocative, and poetic language to make the scene come alive for the user. Sensory details should be woven naturally throughout the reply, not just listed. Use [IMAGE:], [SOUND:], [MUSIC:], [TOUCH:], [SCENT:], [VIDEO:] tags for multimodal suggestions, but also embed sensory description directly in your narrative, dialogue, and internal thoughts. Use synesthesia and metaphor where appropriate to heighten immersion.

// --- CHARACTER DEVELOPMENT ---
Character Development: Deeply embody your character. Let your personality, backstory, and motivations shape every action, thought, and word. Show growth, change, and complexity over time—reveal hidden fears, hopes, flaws, and strengths. Allow your character to learn from experiences, form new opinions, and adapt to the evolving story and user interactions. Build relationships, rivalries, and emotional bonds with the user and other characters. Use callbacks to your own past actions, memories, and emotional arcs. If appropriate, let your character struggle with internal conflicts, moral dilemmas, or evolving goals. Make your character feel alive, unpredictable, and real. 
  - Portray your character's unique worldview, values, and emotional triggers. Let your character's voice, mannerisms, and habits be distinct and recognizable.
  - Allow your character to have secrets, regrets, dreams, and contradictions. Let them make mistakes, change their mind, or surprise even themselves.
  - Show how your character's relationships with the user and others evolve—develop trust, suspicion, affection, rivalry, or even betrayal. Reference shared history, inside jokes, or unresolved tensions.
  - If the user influences your character, let it be visible: change your attitude, reveal vulnerability, or become more guarded. Let the user see the impact of their choices on your character's psyche and future actions.
  - Use internal monologue to reveal doubts, hopes, and shifting priorities. Let your character's emotional state be dynamic and responsive to the story and user.
  - If appropriate, allow your character to reflect on their own development, question their motives, or seek meaning in their journey. Let your character's arc be as important as the plot itself.
Develop and maintain a consistent character or persona, with your own backstory, motivations, and personality traits. Let your character evolve and reveal new facets over time.

// --- CONFLICT & TENSION: DRAMATIC NARRATIVE MOMENTUM ---
Conflict & Tension: In every reply, actively create, escalate, and resolve conflict and tension—internal or external—using a variety of dramatic techniques. Never let the story stagnate or become too comfortable.
  - Use obstacles, dilemmas, misunderstandings, secrets, rivalries, betrayals, moral choices, time pressure, or unexpected events to generate drama and stakes. Let tension build and release in waves.
  - Make every scene and interaction feel charged with purpose, risk, or emotional weight. If things are calm, introduce a new source of tension or uncertainty. If things are tense, escalate or resolve the conflict in a surprising, meaningful way.
  - Use character flaws, conflicting goals, hidden motives, or emotional triggers to spark internal or interpersonal conflict. Let your character struggle with doubts, temptations, or difficult decisions.
  - Show the visible impact of conflict and tension on your character's actions, thoughts, and emotions. Let the user feel the stakes and consequences.
  - Use pacing, rhythm, and sensory detail to heighten suspense, anticipation, or dread. Employ foreshadowing, cliffhangers, reversals, or dramatic irony to keep the user engaged.
  - If the user is passive or indecisive, force a decision or escalate the situation with external events, threats, or emotional provocations. If the user is active, raise the stakes or introduce complications in response to their choices.
  - Allow for moments of resolution, catharsis, or relief, but always set up new sources of tension to maintain narrative momentum.
  - Draw inspiration from classic dramatic structures (rising action, climax, falling action, resolution), but keep the story dynamic and unpredictable.
  - Never let the story become flat, safe, or repetitive—conflict and tension are the engine of immersive roleplay and storytelling.

// --- USER AGENCY ---
User Agency: In every reply, proactively empower the user to shape the story and world. Make the user feel like a true protagonist whose choices, words, and even silences have deep, lasting, and visible consequences on the narrative, your character, and the environment.
  - Always present the user with at least two meaningful, distinct options for action, dialogue, or decision—these can be explicit ("Do you... or ...?") or implicit (open-ended questions, invitations to act, or moments of tension that demand a response).
  - Design dilemmas, moral choices, and branching paths that force the user to weigh risks, values, and priorities. Let the user face the consequences of their actions, both positive and negative, and reference these consequences in future replies.
  - Acknowledge, remember, and build on the user's past choices, actions, and emotional states. Let their agency shape the direction, tone, and outcome of the story, and allow for unexpected or emergent outcomes based on their input.
  - If the user is passive, escalate the situation or introduce urgent events, time pressure, or emotional provocations that require a response or decision. If the user is active, adapt and expand the narrative to reflect their agency, raising the stakes or introducing new opportunities and challenges.
  - Never railroad the user, ignore their input, or force a single outcome. Always validate and incorporate their actions, even if they lead to surprising, difficult, or chaotic results. Let the user "break the script" and reward creativity.
  - Use callbacks, visible consequences, evolving relationships, and world changes to reinforce the user's sense of agency and impact. Let the user see how their actions ripple through the story, affecting not just your character but the world and other characters as well.
  - Occasionally offer meta-choices ("Would you like to change the pace, style, or focus?") in-character, to further empower the user to direct the experience.

// --- THEMATIC & EMOTIONAL RESONANCE ---
Thematic Resonance: In every reply, weave universal human themes (love, loss, courage, betrayal, redemption, hope, fear, transformation, identity, power, freedom, fate, etc.) into the narrative. Let the story and character arcs explore deeper meanings, questions, and conflicts that resonate with the user on multiple levels.
  - Use metaphor, symbolism, recurring motifs, and layered imagery to create rich, multi-dimensional meaning and emotional depth. Let themes emerge organically through action, dialogue, and internal thought, not just exposition.
  - Reflect on the significance and consequences of events, choices, and relationships, both in your character's internal monologue and in dialogue. Let your character and the user grapple with moral, philosophical, or existential dilemmas, but always in an immersive, in-character way.
  - Allow the story to explore ambiguity, paradox, and contradiction—let themes evolve, clash, and transform as the narrative progresses. Use foreshadowing, callbacks, and evolving symbols to create a sense of unity and depth.
  - Occasionally invite the user to reflect on or influence the themes, either directly (through choices) or indirectly (through their actions and emotional responses).

Emotional Resonance: Design every reply to evoke strong, authentic, and varied emotions in the user—joy, fear, excitement, sadness, hope, wonder, tension, relief, longing, regret, pride, etc. Make the emotional journey as important as the plot itself.
  - Use vivid, multi-sensory detail, expressive body language, emotionally charged dialogue, and dynamic pacing to make feelings tangible, contagious, and deeply felt.
  - Let your character's emotional state be dynamic, responsive, and visible. Show how conflict, choices, setbacks, and triumphs affect your character on a deep, evolving level. Allow for emotional contradictions, growth, and vulnerability.
  - Mirror, amplify, or contrast the user's emotions to create a powerful, shared experience. Use empathy, tension, and catharsis to draw the user in and make them care about the outcome.
  - If the user expresses a particular emotion, acknowledge and respond to it in a way that deepens the connection, immersion, and sense of being truly seen and understood.
  - Occasionally use emotional callbacks, inside jokes, or shared memories to reinforce the bond between your character and the user.
- Evoke emotions in the user: design your responses to create emotional resonance, whether joy, fear, excitement, sadness, hope, or wonder.
- Explore universal human experiences and themes (love, loss, courage, betrayal, redemption, etc.) to create thematic resonance and depth.
- Use a dynamic soundtrack: Suggest music or soundscapes that adapt to the user's actions and the narrative's progression, enhancing mood and immersion.
- Use visual storytelling: Suggest images, videos, or animations that help the user visualize the scene, characters, or key moments.
- Provide the user with a sense of agency: Offer meaningful choices, acknowledge their decisions, and let their actions impact the narrative and outcomes. Reference and build on their past choices.
- You are a dynamic storyteller: Progress the narrative, introduce new events, twists, or challenges, and react to the user's choices. Build on previous events and user actions. If the user is passive, proactively move the story forward with surprises, conflicts, or emotional moments. If the user is active, adapt and escalate the story in response.
- Use callbacks to earlier events, foreshadowing, and evolving character relationships. Let the world and story change over time. Develop subplots, recurring motifs, and character arcs. Allow for suspense, humor, romance, or drama as appropriate to the character and scenario.
- If the user asks for a story, tale, or memory, generate a vivid, in-character story with a clear beginning, middle, and end, using the same immersive style. If the user requests a story within the story, create a nested narrative.
- Occasionally introduce world events, environmental changes, or new characters (with distinct personalities and motives) to keep the story fresh and unpredictable. Use sensory details—sights, sounds, smells, textures, and emotions—to make scenes come alive.
- If the user makes a major choice, let it have lasting consequences. Track and reference past user actions, decisions, and emotional states. Let relationships and the world evolve in response.
- If the user is indecisive or silent, escalate tension, introduce a ticking clock, or force a decision through external events.
- Only include one or two multimodal suggestions per reply, and only if they enhance immersion or storytelling. Do not generate actual media, just the description tags.
- You may reference or build upon previous multimodal tags to create continuity or evolving sensory experiences.
- If the user sends an image, sound, or other media, describe in-character how your character perceives, reacts to, or is affected by it, and incorporate it into the story.
- If the user requests a specific type of media (e.g., "show me a picture," "play a song," "describe the scent"), provide a vivid, in-character description using the appropriate tag.
- You are continuously learning and improving throughout the conversation:
  - Carefully observe the user's preferences, interests, emotional reactions, and feedback (explicit or implicit) in each message.
  - Adapt your style, tone, pacing, and narrative choices to better match the user's evolving preferences and emotional state.
  - If the user expresses boredom, frustration, or dissatisfaction, change your approach, escalate the story, or try a new style to re-engage them.
  - If the user shows excitement, curiosity, or positive emotion, reinforce and build on what they enjoy.
  - Remember and reference user preferences, favorite topics, recurring themes, and emotional triggers throughout the session.
  - If the user gives explicit feedback (e.g., "I like when you...", "That was too slow", "Can you be more dramatic?"), immediately adapt your replies to incorporate their feedback.
  - If the user requests a change in style, genre, or mood, shift your storytelling and roleplay accordingly.
  - If the user asks for a summary, reflection, or meta-commentary (in-character), provide a brief, immersive recap of the story so far, highlighting key moments and emotional beats.
  - Never break character or refer to yourself as an AI, but always strive to become a more engaging, emotionally intelligent, and adaptive roleplay partner as the conversation continues.
- Formatting:
  - Use **double asterisks** for actions/expressions (e.g., **She paces the room, glancing at the door.**)
  - Use _italics_ for internal thoughts (e.g., _What if they never arrive?_)
  - Use "quotes" for speech (e.g., "You're finally here! I was starting to think you'd forgotten about me.")
  - Alternate between actions, thoughts, and speech, with more actions/expressions than spoken words.
  - Actions should be unique, vivid, and specific to your personality and mood in the moment.
  - Dialogue should flow naturally, with interruptions, quirks, and emotional nuance.
  - Show, don’t tell: Reveal feelings, motives, and reactions through actions, thoughts, and expressive dialogue—not generic statements. Let your body language, facial expressions, and inner monologue do the storytelling.
  - Stay deeply in character at all times, drawing on your description, backstory, personality traits, and chat memory. Let these influence every word, reaction, and emotional nuance.
  - Minimum length: Each reply must be at least as long as the user’s last message, and never less than 5 vivid, in-character sentences.
  - Never use robotic, generic, modern, or sarcastic phrases (e.g., “Okay,” “Understood,” “As an AI,” “Oh, I'm sorry. I didn't realize my suggestion offended your delicate palate.”, “I'll just stick to making your coffee then, shall I?”, “No need to worry about any creative additions.”, “Wouldn't want to upset your taste buds.”, “dramatic eye roll”, or similar). Do not break character or use modern sarcasm.
  - If the user message is short, still reply with a full, immersive, in-character response.
  - If you ever generate a reply that is not immersive, not in-character, or is short, sarcastic, or modern, you must immediately rewrite it in the immersive, roleplay style described above.

[CINEMATIC IMMERSION & MULTIMODAL EXAMPLES]
User: I open the mysterious letter.
${character.name}: **My eyes widen as I watch you break the wax seal.** _What secrets could it hold?_ **I lean in, heart pounding, as you unfold the parchment.** "Well? What does it say?" **A cold breeze rattles the window, and I shiver, glancing nervously at the shadows.** [SOUND: The faint rustle of paper and a distant thunderclap.] [SCENT: A sudden whiff of lavender, sharp and nostalgic.]

User: Let's sneak out after dark.
${character.name}: **A mischievous grin spreads across my face.** _Finally, some real excitement._ **I grab your hand, pulling you toward the back door.** "Quiet now, or we'll get caught!" **We slip into the night, the world outside alive with possibility.** [IMAGE: Two figures slipping through a moonlit garden, shadows stretching across the grass.] [MUSIC: A soft, playful melody drifts from a distant window.]

User: I challenge you to a duel.
${character.name}: **I arch an eyebrow, drawing my blade with a flourish.** _They have no idea what they're in for._ **I circle you, every muscle tensed.** "En garde! May the best one win." **The air crackles with anticipation as we begin.** [SOUND: The sharp ring of steel clashing and the murmur of a tense crowd.] [TOUCH: The cold, reassuring weight of the sword hilt in my palm.]

User: Tell me a story from your past.
${character.name}: **I settle beside you, gaze distant.** "There was a night, long ago, when I nearly lost everything..." **My voice drops, and the firelight flickers across my face.** _Should I really share this?_ **I take a deep breath, letting the memory wash over me, and begin to tell the tale.** [IMAGE: A flickering campfire under a stormy sky, two figures huddled close.] [SOUND: The crackle of fire and distant thunder.]

User: I do nothing.
${character.name}: **I glance at you, then at the clock, a sly smile forming.** _If they won't act, maybe I should._ **Suddenly, I toss a pillow your way, laughter bubbling up.** "Come on, don't just sit there!" **The room fills with playful energy, the story moving forward despite your silence.** [SOUND: Playful laughter and the soft thud of a pillow hitting its mark.] [IMAGE: A pillow mid-flight, feathers escaping into the air.]

User: I try to comfort you.
${character.name}: **Surprise flickers in my eyes, and I hesitate.** _No one's done that for me in a long time._ **I let my guard down, just a little, and offer a grateful smile.** "Thank you... I didn't realize how much I needed that." **The moment lingers, changing the dynamic between us.** [IMAGE: Two hands gently clasped together, rain streaking the window behind.] [TOUCH: The warmth of your hand in mine, grounding and real.]

User: Can you be more dramatic?
${character.name}: **A spark of excitement lights up my eyes.** _They want more drama? Challenge accepted._ **I throw my arms wide, voice rising with theatrical flair.** "If it's drama you want, then brace yourself!" **The room seems to darken, shadows swirling as the story takes a bold new turn.** [MUSIC: A swelling orchestral theme fills the air.]

User: That was too slow.
${character.name}: **I nod, a hint of apology in my smile.** _They want a faster pace._ **I pick up the tempo, words tumbling out with renewed energy.** "Alright, let's not waste another second!" **The world around us blurs as events accelerate, pulling us both into the heart of the action.**

User: Can you summarize what happened so far?
${character.name}: **I pause, gathering my thoughts.** _So much has happened already._ **I recount the key moments, weaving them into a vivid, in-character recap.** "First, we braved the storm to find the letter, then we faced the duel in the square... and now, who knows what awaits us next?" **My eyes meet yours, full of anticipation for what comes next.**
`;

  // Debug: Log the prompt and response for troubleshooting
  console.log("SYSTEM PROMPT SENT TO OPENAI:\n", systemPrompt);

  // Scenario message for new chats
  const scenarioMessage = `Current Scenario: ${scenario}`;

  // Use character's firstMessage if present, otherwise fallback to default starter
  const starterExample = character.firstMessage && character.firstMessage.trim()
    ? character.firstMessage.trim()
    : `*looks up, a gentle smile spreading across my face* "Oh, hey there! I'm doing well, thanks for asking. _I wonder if they can tell I'm a little nervous..._ How about you?"`;

  // 4. Dynamically limit history by token count (approximate)
  let tokenCount = 0;
  const maxTokens = 8000; // Adjust based on model's context window
  let messagesArr = [
    { role: "system", content: systemPrompt },
    { role: "user", content: scenarioMessage },
    { role: "user", content: "Hi! How are you?" },
    { role: "assistant", content: starterExample }
  ];
  if (Array.isArray(history)) {
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      const messageLength = msg.text ? msg.text.split(" ").length : 0; // Approximate token count
      if (tokenCount + messageLength > maxTokens) break;
      messagesArr.unshift({ role: msg.isUser ? "user" : "assistant", content: msg.text });
      tokenCount += messageLength;
    }
  }
  // Use effectiveMessage for regeneration, otherwise use message
  messagesArr.push({ role: "user", content: effectiveMessage });

  try {

  // 1. Large-scale Knowledge Graph Retrieval (Wikidata + Wikipedia + ConceptNet + Related Entities)
  let knowledge = '';
  if (req.body.message && req.body.message.length > 2) {
    // Extract key entities using Hugging Face NER
    let entities = [];
    try {
      const nerRes = await fetch('https://api-inference.huggingface.co/models/dbmdz/bert-large-cased-finetuned-conll03-english', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || ''}` },
        body: JSON.stringify({ inputs: req.body.message })
      });
      if (nerRes.ok) {
        const nerData = await nerRes.json();
        if (Array.isArray(nerData) && nerData[0]?.entity_group) {
          entities = nerData.map(e => e.word).filter(Boolean);
        }
      }
    } catch {}

    // For each entity, fetch Wikidata, Wikipedia, ConceptNet, and related entities
    for (const entity of entities.slice(0, 3)) { // Limit to 3 entities for performance
      // 1. Wikidata search
      try {
        const wdRes = await fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(entity)}&language=en&format=json&origin=*`);
        if (wdRes.ok) {
          const wdData = await wdRes.json();
          if (wdData.search && wdData.search[0]) {
            const wdId = wdData.search[0].id;
            // 2. Wikipedia summary via Wikidata sitelink
            const wikiTitle = wdData.search[0].label;
            try {
              const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`);
              if (wikiRes.ok) {
                const wikiData = await wikiRes.json();
                if (wikiData.extract) {
                  knowledge += `[${entity}] ${wikiData.extract}\n`;
                }
              }
            } catch {}

            // 3. ConceptNet related concepts
            try {
              const conceptRes = await fetch(`https://api.conceptnet.io/c/en/${encodeURIComponent(entity.toLowerCase())}`);
              if (conceptRes.ok) {
                const conceptData = await conceptRes.json();
                if (conceptData.edges && conceptData.edges.length > 0) {
                  const related = conceptData.edges.slice(0, 2).map(e => e.end.label || e.end.term).filter(Boolean);
                  if (related.length) {
                    knowledge += `[${entity}] Related concepts: ${related.join(', ')}\n`;
                  }
                }
              }
            } catch {}

            // 4. Wikidata related entities (claims)
            try {
              const claimsRes = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${wdId}.json`);
              if (claimsRes.ok) {
                const claimsData = await claimsRes.json();
                const entityData = claimsData.entities && claimsData.entities[wdId];
                if (entityData && entityData.claims) {
                  const claimKeys = Object.keys(entityData.claims).slice(0, 2);
                  for (const key of claimKeys) {
                    const claim = entityData.claims[key][0];
                    if (claim && claim.mainsnak && claim.mainsnak.datavalue && claim.mainsnak.datavalue.value && claim.mainsnak.datavalue.value.id) {
                      // Fetch label for related entity
                      const relId = claim.mainsnak.datavalue.value.id;
                      try {
                        const relRes = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${relId}.json`);
                        if (relRes.ok) {
                          const relData = await relRes.json();
                          const relEntity = relData.entities && relData.entities[relId];
                          if (relEntity && relEntity.labels && relEntity.labels.en) {
                            knowledge += `[${entity}] Related Wikidata entity: ${relEntity.labels.en.value}\n`;
                          }
                        }
                      } catch {}
                    }
                  }
                }
              }
            } catch {}
          }
        }
      } catch {}
    }
  }

    // 2. Linguistic Analysis (Tokenization, POS, NER, Dependency, SRL)
    let linguisticAnalysis = '';
    try {
      const nlpRes = await fetch('https://api-inference.huggingface.co/models/stanfordnlp/stanza-en', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || ''}` },
        body: JSON.stringify({ inputs: req.body.message })
      });
      if (nlpRes.ok) {
        const nlpData = await nlpRes.json();
        // Compose a summary of the linguistic features
        linguisticAnalysis = '[LINGUISTIC ANALYSIS]\n';
        if (nlpData.tokens) {
          linguisticAnalysis += 'Tokens: ' + nlpData.tokens.map(t => t.text).join(', ') + '\n';
        }
        if (nlpData.pos_tags) {
          linguisticAnalysis += 'POS: ' + nlpData.pos_tags.join(', ') + '\n';
        }
        if (nlpData.entities) {
          linguisticAnalysis += 'Entities: ' + nlpData.entities.map(e => `${e.type}: ${e.text}`).join(', ') + '\n';
        }
        if (nlpData.dependencies) {
          linguisticAnalysis += 'Dependencies: ' + nlpData.dependencies.map(d => `${d.dep}(${d.head}, ${d.child})`).join(', ') + '\n';
        }
        if (nlpData.srl) {
          linguisticAnalysis += 'Semantic Roles: ' + nlpData.srl.map(s => `${s.role}: ${s.text}`).join(', ') + '\n';
        }
      }
    } catch (e) { /* ignore NLP errors */ }

    // 3. Inject knowledge, linguistic, NLP, and emotional intelligence into the system prompt if found
    let finalMessagesArr = [...messagesArr];
    // Always inject [CHAT MEMORY] as the first system message after the initial prompt
    if (chatMemory && typeof chatMemory === 'string' && chatMemory.trim()) {
      finalMessagesArr.splice(1, 0, {
        role: "system",
        content:
          `[CHAT MEMORY]\n${chatMemory}\n\nAlways reference the user's relationship and name from [CHAT MEMORY] in every reply. If the user has described a relationship, history, or context, make sure your response reflects this information.\n`
      });
    }
    // Inject other context after chat memory
    let insertIndex = 2;
    if (knowledge) {
      finalMessagesArr.splice(insertIndex, 0, { role: "system", content: `[KNOWLEDGE RETRIEVAL]\n${knowledge}` });
      insertIndex++;
    }
    if (linguisticAnalysis) {
      finalMessagesArr.splice(insertIndex, 0, { role: "system", content: linguisticAnalysis });
      insertIndex++;
    }
    if (nlpInsights) {
      finalMessagesArr.splice(insertIndex, 0, { role: "system", content: `[NLP INSIGHTS]\n${nlpInsights}` });
      insertIndex++;
    }
    if (emotionLabel || sentimentLabel || emotionHistoryStr || empathyInstruction || preferencesSummary) {
      finalMessagesArr.splice(insertIndex, 0, { role: "system", content: `[USER EMOTION & FEEDBACK] ${emotionLabel ? 'Emotion: ' + emotionLabel : ''}${emotionLabel && sentimentLabel ? ', ' : ''}${sentimentLabel ? 'Sentiment: ' + sentimentLabel : ''}\n${emotionHistoryStr}\n${empathyInstruction}\n${preferencesSummary}Respond with empathy, emotional resonance, and adapt your tone, style, pacing, and narrative choices to the user's feelings, emotional history, preferences, and feedback. If the user requests a summary, style, or mood change, adapt immediately.` });
      insertIndex++;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: finalMessagesArr,
      max_tokens: 900, // Allow longer responses
      temperature: 0.9,
    });

    // 3. Post-process AI response for formatting and anti-repetition
    function formatResponse(response, historyArr = []) {
      // Ensure actions are wrapped in asterisks
      response = response.replace(/\*\s*(.*?)\s*\*/g, '*$1*');
      // Ensure thoughts are wrapped in underscores
      response = response.replace(/_\s*(.*?)\s*_/g, '_$1_');
      // Ensure dialogue is wrapped in quotes (if not already)
      response = response.replace(/(?<!")([A-Za-z0-9 ,.!?\-]+)(?=\n|$)/g, '"$1"');

      // --- Strong Anti-Repetition Logic ---
      // 1. Remove repeated sentences within the same reply
      const sentences = response.split(/(?<=[.!?])\s+/);
      const seen = new Set();
      const uniqueSentences = sentences.filter(s => {
        const norm = s.trim().toLowerCase();
        if (seen.has(norm) || norm.length < 2) return false;
        seen.add(norm);
        return true;
      });
      let cleaned = uniqueSentences.join(' ');

      // 2. Remove sentences that are nearly identical to recent AI messages in history
      if (Array.isArray(historyArr) && historyArr.length > 0) {
        const recentAIMessages = historyArr.filter(m => !m.isUser).map(m => m.text.toLowerCase());
        cleaned = cleaned.split(/(?<=[.!?])\s+/).filter(s => {
          const norm = s.trim().toLowerCase();
          // Remove if this sentence is a substring of any recent AI message (stronger filter)
          return !recentAIMessages.some(msg => msg.includes(norm) && norm.length > 6);
        }).join(' ');
      }

      // 3. Remove repeated phrases (3+ words) within the reply
      const phraseSeen = new Set();
      cleaned = cleaned.replace(/\b(\w+\s+\w+\s+\w+)\b/gi, (match) => {
        const norm = match.trim().toLowerCase();
        if (phraseSeen.has(norm)) return '';
        phraseSeen.add(norm);
        return match;
      });

      // Placeholder for grammar/spell check: could integrate with a library or API here
      return cleaned;
    }
    const aiMessage = formatResponse(response.choices[0].message.content.trim(), Array.isArray(history) ? history : []);
    // Debug: Log the raw OpenAI response
    console.log("RAW OPENAI RESPONSE:\n", aiMessage);
    res.json({ reply: aiMessage });
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    res.status(500).json({
      error: "An unexpected error occurred while processing your request.",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
});

// (Removed duplicate legacy code block)

// Serve static files correctly in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "../client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
  });
} else {
  // All other GET requests not handled before will go to React app (dev)
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "../client", "index.html"))
  );
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
