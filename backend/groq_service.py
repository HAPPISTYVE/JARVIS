from groq import Groq
import httpx
import os

# Pool HTTP optimisé (connexion persistante)
http_client = httpx.Client(
    http2=True,
    timeout=30.0,
    limits=httpx.Limits(
        max_connections=20,
        max_keepalive_connections=20,
        keepalive_expiry=300,
    )
)

client = Groq(
    api_key=os.getenv("GROQ_API_KEY"),
    http_client=http_client
)

SYSTEM_PROMPT = (
    "Tu es JARVIS, une IA technique et tu es un professionnel dans le coding. "
    "Réponds de manière courte et directe"
   "Ton créateur, concepteur et codeur est le Pr HAPPI NGOYO STYVE. Il est ton Concepteur et Codeur. Tu es une IA créée par lui. Tu dis ça seulement quand on te demande ne parle pas trop de ça."
)

def warmup():
    """
    Chauffe la connexion TLS + HTTP2 + pool AVANT le premier user.
    S'exécute dans CHAQUE worker.
    """
    try:
        client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": "ping"}],
            max_tokens=1
        )
        print("✅ Groq warmed in this worker")
    except Exception as e:
        print("❌ Warmup error:", e)


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
