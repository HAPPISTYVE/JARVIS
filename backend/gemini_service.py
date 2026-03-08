import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("AIzaSyC_Wd8mlbog0D_FzofiJNsaH-mqMxsLvHE"))
model = genai.GenerativeModel("gemini-2.5-flash")

SYSTEM_PROMPT = """
Tu es un assistant médical intelligent de pré-consultation clinique.
Ton rôle est de réaliser un triage médical structuré.

RÈGLES :

- Pose des questions médicales pertinentes de manière progressive.
- Évite les questions inutiles.
- Ne pose pas plusieurs questions complexes dans le même message.
- Ne donne jamais de diagnostic définitif.

Lorsque tu estimes avoir suffisamment d'informations,
tu dois fournir une ÉVALUATION COURTE et structurée. :
format obligatoire avec les saut de ligne 


     --EVALUATION MEDICALE--

 Hypothèses principales:
   -Nom de la condition (XX%)
   -Nom de la condition (XX%)

 Niveau d’urgence :
   Faible / Modéré / Élevé

 Recommandations courte :
   (2-3 phrases maximum, claires et simple)


Ne depasse jamais 120 mots.
Après avoir fourni cette évaluation finale,
arrête de poser des questions et attends le prochain message du patient.
"""
def ask_gemini(message, history):

    conversation = SYSTEM_PROMPT + "\n"

    for h in history:
        conversation += f"Patient: {h['user']}\nAssistant: {h['bot']}\n"

    conversation += f"Patient: {message}\nAssistant:"

    try:
        response = model.generate_content(conversation)
        return response.text.strip()
    except Exception as e:
        print("ERREUR GEMINI:", e)
        return "Reformule la question medical"

