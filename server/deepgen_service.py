# deepgen_service.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

# Example: Use torch and a dummy LSTM model (replace with your own)
# (For demo, we just echo the prompt. Replace with your model logic.)

app = FastAPI()

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    prompt: str
    model: Optional[str] = "lstm"
    max_length: Optional[int] = 100
    temperature: Optional[float] = 1.0

@app.post("/generate")
async def generate_text(req: GenerateRequest):
    # Replace this with your actual RNN/LSTM/GAN text generation logic
    prompt = req.prompt
    max_length = req.max_length or 100
    temperature = req.temperature or 1.0

    # Dummy output for demonstration
    generated = f"[{req.model.upper()} OUTPUT] {prompt} ... (generated {max_length} tokens, temp={temperature})"
    # TODO: Replace with your model's output

    return {"generated": generated}

# To run: uvicorn deepgen_service:app --host 0.0.0.0 --port 8000
