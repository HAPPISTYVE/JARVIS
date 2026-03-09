
import google.generativeai as genai
import os

# Récupère la clé API depuis les variables d'environnement
genai.configure(api_key=os.getenv("AIzaSyC_Wd8mlbog0D_FzofiJNsaH-mqMxsLvHE"))
model = genai.GenerativeModel("gemini-2.5-flash")

# Initialise le modèle
model = genai.GenerativeModel("gemini-2.5-flash")

SYSTEM_PROMPT = """
Tu es JARVIS, un assistant intelligent et polyvalent.
Réponds de manière claire, concise et naturelle.
Aide l’utilisateur pour toutes sortes de questions, de façon amicale et compréhensible.
Évite les réponses trop longues, sois pratique et direct.
"""

def ask_gemini(message, history):
    """Envoie le message au modèle Gemini et retourne la réponse."""
    conversation = SYSTEM_PROMPT + "\n"

    for h in history:
        conversation += f"Patient: {h['user']}\nAssistant: {h['bot']}\n"

    conversation += f"Patient: {message}\nAssistant:"

    try:
        response = model.generate_content(conversation)
        return response.text.strip()  # <- ici le return est à l'intérieur de la fonction
    except Exception as e:
        print("ERREUR GEMINI:", e)
        return "Reformule la question."
