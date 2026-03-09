
import google.generativeai as genai
import os
from dotenv import load_dotenv
import traceback

# ----------------------------
# Chargement variables d'environnement
# ----------------------------
load_dotenv()
genai.configure(api_key=os.getenv("AIzaSyC_Wd8mlbog0D_FzofiJNsaH-mqMxsLvHE"))
model = genai.GenerativeModel("gemini-2.5-flash")
# ----------------------------
# Initialisation modèle
# ----------------------------
model = genai.GenerativeModel("gemini-2.5-flash")

# ----------------------------
# Prompt système
# ----------------------------
SYSTEM_PROMPT = """
Tu es JARVIS, un assistant intelligent et polyvalent.
Réponds de manière claire, concise et naturelle.
Aide l’utilisateur pour toutes sortes de questions, de façon amicale et compréhensible.
Évite les réponses trop longues, sois pratique et direct.
"""

# ----------------------------
# Fonction ask_gemini
# ----------------------------
def ask_gemini(message, history):
    conversation = SYSTEM_PROMPT + "\n"

    for h in history:
        conversation += f"Patient: {h['user']}\nAssistant: {h['bot']}\n"

    conversation += f"Patient: {message}\nAssistant:"

    try:
        response = model.generate_content(conversation)
        return response.text.strip()
    except Exception as e:
        # Affiche l'erreur complète pour debug
        print("=== ERREUR GEMINI ===")
        traceback.print_exc()
        # Réponse dynamique de secours
        return f"Tu as dit : {message}"
