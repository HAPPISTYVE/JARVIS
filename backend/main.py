from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq

# --- CLÉ DIRECTEMENT DANS LE CODE POUR TEST ---
YOUR_API_KEY = "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"  # remplace par ta vraie clé

client = Groq(api_key=YOUR_API_KEY)

app = FastAPI(title="Test Groq API")

class Message(BaseModel):
    message: str

@app.get("/")
def health_check():
    return {"status": "online"}

@app.post("/chat")
def chat(data: Message):
    try:
        resp = client.chat.completions.create(
            model="llama-3.1-8b-instant"",
            messages=[{"role": "user", "content": data.message}]
        )
        return {"response": resp.choices[0].message.content}
    except Exception as e:
        return {"error": str(e)}
