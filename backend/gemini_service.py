import google.generativeai as genai
import os

def ask_gemini(message, history):
    # Récupère la clé (Assure-toi que le nom API_KEY est le même sur Render)
    api_key = os.getenv("API_KEY")
    genai.configure(api_key=api_key)
    
    try:
        # Initialisation propre avec le nom officiel
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Envoi simple
        response = model.generate_content(message)
        return response.text.strip()
        
    except Exception as e:
        print(f"DEBUG LOGS: {e}")
        return f"Erreur : {e}"
