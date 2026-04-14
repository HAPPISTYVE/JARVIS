# groq_service.py
from groq import Groq
import httpx
import os

#  Client HTTP persistant (garde la connexion ouverte)
http_client = httpx.Client(http2=True, timeout=30.0)

client = Groq(
    api_key=os.getenv("GROQ_API_KEY"),
    http_client=http_client
)

SYSTEM_PROMPT = "Tu es JARVIS, une IA technique et tu es un professionnel dans le coding. Réponds de manière courte et directe"

def ask_groq(message, history):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for h in history:
        messages.append({"role": "user", "content": h["user"]})
        messages.append({"role": "assistant", "content": h["bot"]})

    messages.append({"role": "user", "content": message})

    resp = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
    )

    return resp.choices[0].message.content
