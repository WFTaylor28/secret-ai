# deepgen_service_lstm.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
import torch.nn.functional as F
import random

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
class GenerateRequest(BaseModel):
    prompt: str
    model: Optional[str] = "lstm"
    max_length: Optional[int] = 100
    temperature: Optional[float] = 1.0
    backstory: Optional[str] = None
    description: Optional[str] = None
    personality: Optional[str] = None


# Use character context in prompt
@app.post("/generate")
async def generate_text(req: GenerateRequest):
    # Compose context-aware prompt
    context_parts = []
    if req.backstory:
        context_parts.append(f"Backstory: {req.backstory}")
    if req.description:
        context_parts.append(f"Description: {req.description}")
    if req.personality:
        context_parts.append(f"Personality: {req.personality}")
    context = "\n".join(context_parts)
    # Final prompt: context + user prompt
    if context:
        full_prompt = context + "\nUser: " + req.prompt
    else:
        full_prompt = req.prompt
    max_length = req.max_length or 100
    temperature = req.temperature or 1.0
    if req.model and req.model.lower() == "lstm":
        generated = sample_lstm(full_prompt, max_length, temperature)
    else:
        generated = f"[GAN OUTPUT] {full_prompt} ... (GAN not implemented in this demo)"
    return {"generated": generated}

# To run: uvicorn deepgen_service_lstm:app --host 0.0.0.0 --port 8000
