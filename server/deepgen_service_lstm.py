# deepgen_service_lstm.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
import torch.nn.functional as F
import random
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dummy vocabulary and model for demonstration
VOCAB = list("abcdefghijklmnopqrstuvwxyz .,!?\n")
CHAR2IDX = {c: i for i, c in enumerate(VOCAB)}
IDX2CHAR = {i: c for i, c in enumerate(VOCAB)}
VOCAB_SIZE = len(VOCAB)

class SimpleLSTM(nn.Module):
    def __init__(self, vocab_size, hidden_size=128, num_layers=1):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, hidden_size)
        self.lstm = nn.LSTM(hidden_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, vocab_size)

    def forward(self, x, hidden=None):
        x = self.embed(x)
        out, hidden = self.lstm(x, hidden)
        out = self.fc(out)
        return out, hidden

# Instantiate a dummy model (not trained)
model = SimpleLSTM(VOCAB_SIZE)
model.eval()

def sample_lstm(prompt, max_length=100, temperature=1.0):
    # Convert prompt to indices
    input_idxs = [CHAR2IDX.get(c, 0) for c in prompt.lower() if c in CHAR2IDX]
    if not input_idxs:
        input_idxs = [random.randint(0, VOCAB_SIZE-1)]
    input_tensor = torch.tensor([input_idxs], dtype=torch.long)
    generated = input_idxs.copy()
    hidden = None
    for _ in range(max_length):
        out, hidden = model(input_tensor, hidden)
        logits = out[0, -1] / temperature
        probs = F.softmax(logits, dim=0).detach().numpy()
        idx = int(np.random.choice(len(probs), p=probs/probs.sum()))
        generated.append(idx)
        input_tensor = torch.tensor([[idx]], dtype=torch.long)
    return ''.join(IDX2CHAR[i] for i in generated)

import numpy as np


# Add character context fields

# Expanded character profile

# --- Narrative, Memory, and Relationship Context ---
class GenerateRequest(BaseModel):
    prompt: str
    model: Optional[str] = "lstm"
    max_length: Optional[int] = 100
    temperature: Optional[float] = 1.0
    backstory: Optional[str] = None
    description: Optional[str] = None
    personality: Optional[str] = None
    motivations: Optional[str] = None
    values: Optional[str] = None
    # New fields for advanced features
    user_id: Optional[str] = None
    character_id: Optional[str] = None
    environment: Optional[dict] = None  # e.g., {"lighting": "dim", "noise": "loud"}
    feedback: Optional[str] = None
    user_skill: Optional[str] = None  # e.g., "beginner", "advanced"
    choice: Optional[str] = None  # for multi-path storytelling
# --- Enhanced FSM for emotions and actions ---
class NarrativeThread:
    def __init__(self):
        self.threads = {}
    def update(self, user_id, character_id, prompt):
        # Simple narrative thread: append prompt to thread
        key = (user_id, character_id)
        if key not in self.threads:
            self.threads[key] = []
        self.threads[key].append(prompt)
        # Limit thread length for memory
        self.threads[key] = self.threads[key][-10:]
        return self.threads[key]

# Contextual memory for each user/character
class ContextualMemory:
    def __init__(self):
        self.memory = {}
    def recall(self, user_id, character_id):
        return self.memory.get((user_id, character_id), [])
    def remember(self, user_id, character_id, entry):
        key = (user_id, character_id)
        if key not in self.memory:
            self.memory[key] = []
        self.memory[key].append(entry)
        self.memory[key] = self.memory[key][-20:]
        return self.memory[key]

# Character relationships (simple graph)
class CharacterRelationships:
    def __init__(self):
        self.graph = {}  # {(char1, char2): strength}
    def update(self, char1, char2, delta):
        key = tuple(sorted([char1, char2]))
        self.graph[key] = self.graph.get(key, 0) + delta
    def get(self, char1, char2):
        key = tuple(sorted([char1, char2]))
        return self.graph.get(key, 0)

# Dynamic personality (evolves over time)
class DynamicPersonality:
    def __init__(self):
        self.states = {}
    def update(self, character_id, feedback=None, experience=None):
        # Naive: feedback or experience can nudge personality
        if character_id not in self.states:
            self.states[character_id] = {"kind": 1, "sarcastic": 1, "brave": 1, "loyal": 1}
        if feedback:
            if "rude" in feedback:
                self.states[character_id]["sarcastic"] += 1
            if "nice" in feedback:
                self.states[character_id]["kind"] += 1
        # Clamp values
        for k in self.states[character_id]:
            self.states[character_id][k] = max(1, min(10, self.states[character_id][k]))
        return self.states[character_id]

# Adaptive difficulty
def get_difficulty(user_skill):
    if user_skill == "beginner":
        return "easy"
    elif user_skill == "advanced":
        return "hard"
    return "normal"

# Human-like behavior: add hesitations, pauses, mistakes

# --- Slang, Jargon, Accent, Tone, Subtext, Humor, Vulnerability ---
def apply_slang_and_jargon(text, personality=None):
    # Simple slang/jargon injection for youthful/modern tone
    slang = [
        ("hello", "yo"),
        ("friend", "bro"),
        ("amazing", "lit"),
        ("very good", "fire"),
        ("angry", "salty"),
        ("sad", "down bad"),
        ("happy", "hyped"),
        ("cool", "dope"),
        ("not sure", "idk"),
        ("really", "fr"),
        ("joking", "no cap"),
        ("serious", "deadass"),
    ]
    for k, v in slang:
        text = text.replace(k, v)
    # Add more slang for certain personalities
    if personality and "youthful" in personality.lower():
        text += " lol"
    return text

def apply_accent_and_dialect(text, accent=None):
    # Simple accent/dialect transformation
    if accent == "british":
        text = text.replace("color", "colour").replace("favorite", "favourite").replace("mom", "mum")
        text = text.replace("hello", "'ello")
    elif accent == "southern":
        text = text.replace("you", "y'all").replace("my", "mah")
    elif accent == "pirate":
        text = text.replace("my", "me").replace("is", "be").replace("hello", "ahoy")
    return text

def apply_tone_and_inflection(text, emotion=None):
    # Add tone/inflection cues
    if emotion == "angry":
        text = text.upper() + "!"
    elif emotion == "sad":
        text = text + "..."
    elif emotion == "happy":
        text = text + " :)"
    elif emotion == "afraid":
        text = text + " (voice trembling)"
    return text

def add_subtext(text, personality=None, emotion=None):
    # Add subtext for nuance
    if personality and "sarcastic" in personality:
        text += " (but doesn't really mean it)"
    elif emotion == "sad":
        text += " (trying to hide their true feelings)"
    return text

def add_contextual_reference(text, context=None):
    # Add a simple contextual reference
    if context and "Backstory" in context:
        text += " (remembers their past)"
    return text

def add_wordplay_and_humor(text, personality=None):
    # Add wordplay/humor for lightheartedness
    if personality and "funny" in personality:
        jokes = [
            "Why did the AI cross the road? To optimize the chicken!",
            "I'm not lazy, I'm just on energy-saving mode.",
            "I would tell you a joke about UDP, but you might not get it."
        ]
        text += " " + random.choice(jokes)
    return text

def add_vulnerability(text, personality=None, emotion=None):
    # Add vulnerability and imperfection
    if emotion == "afraid":
        text += " (voice cracks a little)"
    if personality and "shy" in personality:
        text += " (hesitates)"
    if random.random() < 0.1:
        text += " Sorry, I might be wrong."
    return text

def humanize_dialogue(text):
    if random.random() < 0.2:
        text = "... " + text
    if random.random() < 0.2:
        text = text.replace(",", ", um,")
    if random.random() < 0.1:
        text = text + " (pauses)"
    return text




# --- Enhanced FSM for emotions and actions ---
class EmotionFSM:
    def __init__(self):
        self.emotion = "neutral"
        self.action = "idle"
    def update(self, prompt):
        # Improved emotion detection
        p = prompt.lower()
        if any(w in p for w in ["angry", "mad", "furious", "rage", "irritated"]):
            self.emotion = "angry"
            self.action = "confront"
        elif any(w in p for w in ["sad", "cry", "upset", "depressed", "tears"]):
            self.emotion = "sad"
            self.action = "comfort"
        elif any(w in p for w in ["happy", "joy", "excited", "delighted", "cheerful"]):
            self.emotion = "happy"
            self.action = "celebrate"
        elif any(w in p for w in ["afraid", "scared", "fear", "nervous"]):
            self.emotion = "afraid"
            self.action = "reassure"
        else:
            self.emotion = "neutral"
            self.action = "idle"
        return self.emotion, self.action


# --- Enhanced Behavior Tree for dialogue selection ---
def behavior_tree(personality, emotion, action, prompt, motivations, values, backstory, description):
    # Use all available context for nuanced dialogue
    personality = (personality or "").lower()
    motivations = (motivations or "").lower()
    values = (values or "").lower()
    backstory = (backstory or "").lower()
    description = (description or "").lower()
    prompt = prompt.lower()

    # Sarcastic
    if "sarcastic" in personality:
        if emotion == "angry":
            return "Oh, great. Just what I needed today. (rolls eyes)"
        elif emotion == "happy":
            return "Wow, what a joy. Truly, I'm thrilled. (smirks)"
        elif emotion == "sad":
            return "Oh, fantastic. Let's all cry together. (mock tears)"
        elif emotion == "afraid":
            return "Oh, sure, let's all panic now."
        else:
            return "Sure, because that's exactly what I wanted to do."
    # Kind
    if "kind" in personality:
        if emotion == "angry":
            return "I understand you're upset. Let's try to calm down together. (gentle tone)"
        elif emotion == "happy":
            return "That's wonderful! I'm so glad to hear it. (smiles warmly)"
        elif emotion == "sad":
            return "I'm here for you. It's okay to feel sad sometimes. (offers comfort)"
        elif emotion == "afraid":
            return "It's okay to be scared. I'm right here with you. (reassuring)"
        else:
            return "How can I help you today?"
    # Brave
    if "brave" in personality or "courage" in values:
        if emotion == "afraid":
            return "Fear is just a feeling. Let's face it together. (stands tall)"
        elif emotion == "angry":
            return "Anger can be powerful. Let's use it to do what's right."
        else:
            return "No challenge is too great."
    # Loyal
    if "loyal" in personality or "loyalty" in values:
        return "You can always count on me. (steadfast gaze)"
    # Motivated by justice
    if "justice" in motivations or "justice" in values:
        return "I can't stand by when something's unfair. (firm voice)"
    # Default
    if emotion == "angry":
        return "What do you want? (tense)"
    elif emotion == "happy":
        return "That's great! (cheerful)"
    elif emotion == "sad":
        return "I'm sorry to hear that. (softly)"
    elif emotion == "afraid":
        return "We'll get through this. (encouraging)"
    return "Yes?"


# --- Enhanced Sensory/Descriptive/Action-Oriented Dialogue Generator ---
def generate_descriptive_dialogue(req: GenerateRequest, emotion: str, action: str, memory=None, narrative=None, relationship=None, dynamic_personality=None, difficulty="normal"):
    # Use all context fields
    context = []
    if req.backstory:
        context.append(f"Backstory: {req.backstory}")
    if req.description:
        context.append(f"Description: {req.description}")
    if req.personality:
        context.append(f"Personality: {req.personality}")
    if req.motivations:
        context.append(f"Motivations: {req.motivations}")
    if req.values:
        context.append(f"Values: {req.values}")
    context_str = "\n".join(context)


    # Multi-path storytelling: branch on user choice
    if req.choice:
        if req.choice == "confront":
            dialogue = "You decide to confront the issue head-on. (bold)"
        elif req.choice == "avoid":
            dialogue = "You choose to avoid the situation for now. (hesitant)"
        else:
            dialogue = f"You make a choice: {req.choice}. (thoughtful)"
    else:
        # Dialogue selection
        dialogue = behavior_tree(
            req.personality, emotion, action, req.prompt,
            req.motivations, req.values, req.backstory, req.description
        )

    # Add narrative thread and memory context
    if narrative:
        context.append(f"Narrative Thread: {' | '.join(narrative)}")
    if memory:
        context.append(f"Memory: {' | '.join(memory)}")
    if relationship:
        context.append(f"Relationship: {relationship}")
    if dynamic_personality:
        context.append(f"Dynamic Personality: {dynamic_personality}")
    context_str = "\n".join(context)

    # Enhanced sensory details
    sensory_options = [
        "The air feels heavy with anticipation.",
        "A faint scent of rain lingers in the room.",
        "You can almost taste the tension in the air.",
        "The light flickers, casting long shadows.",
        "A distant dog barks, breaking the silence.",
        "Sunlight streams through dusty windows, painting golden patterns.",
        "A cold breeze brushes past, raising goosebumps.",
        "The floor creaks beneath cautious footsteps.",
        "The aroma of fresh bread wafts from a nearby bakery.",
        "Rain patters softly against the glass."
    ]
    sensory = random.choice(sensory_options)

    # Enhanced action-oriented cues
    action_options = [
        "(leans forward, eyes narrowed)",
        "(smiles warmly, hands clasped)",
        "(rolls eyes dramatically)",
        "(sighs, glancing away)",
        "(nods thoughtfully)",
        "(paces restlessly)",
        "(crosses arms, defiant)",
        "(wipes away a tear)",
        "(laughs, voice echoing)",
        "(shivers slightly)"
    ]
    # Optionally bias action to emotion/action state
    if action == "comfort":
        action_cue = random.choice(["(offers a comforting smile)", "(places a gentle hand on your shoulder)"])
    elif action == "confront":
        action_cue = random.choice(["(stands tall, unyielding)", "(voice sharp, unwavering)"])
    elif action == "celebrate":
        action_cue = random.choice(["(claps hands joyfully)", "(grins with excitement)"])
    elif action == "reassure":
        action_cue = random.choice(["(softly reassures)", "(gives a calming nod)"])
    else:
        action_cue = random.choice(action_options)


    # --- Slang, Jargon, Accent, Tone, Subtext, Contextual Reference, Humor, Vulnerability ---
    dialogue = apply_slang_and_jargon(dialogue, req.personality)
    dialogue = apply_accent_and_dialect(dialogue, accent=getattr(req, 'accent', None))
    dialogue = apply_tone_and_inflection(dialogue, emotion)
    dialogue = add_subtext(dialogue, req.personality, emotion)
    dialogue = add_contextual_reference(dialogue, context_str)
    dialogue = add_wordplay_and_humor(dialogue, req.personality)
    dialogue = add_vulnerability(dialogue, req.personality, emotion)
    dialogue = humanize_dialogue(dialogue)

    # Compose response
    response = {
        "dialogue": dialogue,
        "emotion": emotion,
        "action": action_cue,
        "sensory": sensory,
        "context": context_str,
        "descriptive": f"{action_cue} {dialogue} {sensory}",
        "difficulty": difficulty
    }
    return response

# ---
# Note: For NLP, ML, deep learning, rule-based, and hybrid approaches:
# - NLP/ML/Deep learning can be integrated in the dialogue generation pipeline above.
# - Rule-based systems are demonstrated in the current logic.
# - Hybrid approaches can combine the above with model-based outputs.



# --- Instantiate narrative, memory, relationship, and dynamic personality managers ---
emotion_fsm = EmotionFSM()
narrative_manager = NarrativeThread()
memory_manager = ContextualMemory()
relationship_manager = CharacterRelationships()
dynamic_personality_manager = DynamicPersonality()


@app.post("/generate")
async def generate_text(req: GenerateRequest):
    # Update emotion and action state
    emotion, action = emotion_fsm.update(req.prompt)

    # Narrative thread and contextual memory
    narrative = narrative_manager.update(req.user_id, req.character_id, req.prompt) if req.user_id and req.character_id else None
    memory = memory_manager.recall(req.user_id, req.character_id) if req.user_id and req.character_id else None
    memory_manager.remember(req.user_id, req.character_id, req.prompt) if req.user_id and req.character_id else None

    # Character relationships (for multi-character scenarios)
    relationship = None
    if req.character_id and req.user_id:
        # Example: user_id is treated as another character for relationship
        relationship = relationship_manager.get(req.character_id, req.user_id)
        # Optionally update relationship based on feedback
        if req.feedback:
            delta = 1 if "positive" in req.feedback else -1 if "negative" in req.feedback else 0
            relationship_manager.update(req.character_id, req.user_id, delta)

    # Dynamic personality
    dynamic_personality = None
    if req.character_id:
        dynamic_personality = dynamic_personality_manager.update(req.character_id, feedback=req.feedback)

    # Adaptive difficulty
    difficulty = get_difficulty(req.user_skill)

    # Environmental influence (affect sensory/action cues)
    # (For demo, just append to context)
    if req.environment:
        env_desc = ", ".join(f"{k}: {v}" for k, v in req.environment.items())
        req.description = (req.description or "") + f" Environment: {env_desc}"

    # Generate descriptive, personality-driven, action-oriented dialogue
    response = generate_descriptive_dialogue(
        req, emotion, action,
        memory=memory, narrative=narrative, relationship=relationship,
        dynamic_personality=dynamic_personality, difficulty=difficulty
    )

    # Optionally, generate a dummy LSTM output for the dialogue (for demo)
    if req.model and req.model.lower() == "lstm":
        # Use the composed descriptive string as prompt
        generated = sample_lstm(response["descriptive"], req.max_length or 100, req.temperature or 1.0)
        response["lstm_generated"] = generated
    else:
        response["lstm_generated"] = f"[GAN OUTPUT] {response['descriptive']} ... (GAN not implemented in this demo)"
    return response

# ---
# Note: For graph-based models, evolutionary algorithms, and reinforcement learning,
# you would integrate those in the managers above or in the dialogue/action selection logic.
# This code provides extensible stubs and demo logic for all requested features.

# To run: uvicorn deepgen_service_lstm:app --host 0.0.0.0 --port 8000
