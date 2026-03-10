from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq

# --- CLÉ DIRECTEMENT DANS LE CODE POUR TEST ---
YOUR_API_KEY = "Gsk_MVDMnfJZpoagJYsT6TDDWGdyb3FY8p7Kz4n1ciDKbYVv98e4wwoS"  # remplace par ta vraie clé

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
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": data.message}]
        )
        return {"response": resp.choices[0].message.content}
    except Exception as e:
        return {"error": str(e)}
