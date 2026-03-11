from groq import Groq
import os

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def ask_groq(message, history):

    messages = [
        {
            "role": "system",
            "content": "Tu es JARVIS, une intelligence artificielle technique qui aide l'utilisateur à résoudre des problèmes, programmer, apprendre et gérer ses projets."
        }
    ]

    for h in history:
        messages.append({"role": "user", "content": h["user"]})
        messages.append({"role": "assistant", "content": h["bot"]})

    messages.append({"role": "user", "content": message})

    resp = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages
    )

    return resp.choices[0].message.content
