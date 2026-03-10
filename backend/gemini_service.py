import google.generativeai as genai
import os

# 1. Récupération de la clé
api_key = os.getenv("API_KEY")
genai.configure(api_key=api_key)

def ask_gemini(message, history):
    try:
        # Configuration spécifique pour éviter le 404
        # On peut parfois forcer la version de l'API dans l'appel
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash"
        )
        
        # Test avec un contenu simple
        response = model.generate_content(message)
        
        return response.text.strip()
        
    except Exception as e:
        # Si ça échoue encore en 404, on tente le nom complet
        try:
            print("Tentative avec le nom complet du modèle...")
            model_retry = genai.GenerativeModel("models/gemini-1.5-flash")
            response = model_retry.generate_content(message)
            return response.text.strip()
        except Exception as e2:
            print(f"ERREUR FINALE : {e2}")
            return f"Monsieur, l'accès au modèle est refusé : {e2}"
