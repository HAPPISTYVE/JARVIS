from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from models import Patient
from gemini_service import ask_gemini
from conversation_engine import update_patient
from redflag_engine import evaluate_redflags
from protocol_engine import headache_protocol
from ml_engine import predict
from pdf_generator import generate_pdf
import shutil, os
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# --- AJOUTE L'IMPORT MANQUANT ICI ---
# from audio_service import speech_to_text 

app = FastAPI(title="JARVIS Medical API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://jarvis-eight-navy.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions = {}

class Message(BaseModel):
    session_id: str
    message: str

@app.get("/")
def health_check():
    return {"status": "online", "system": "JARVIS"}

@app.post("/chat")
async def chat(data: Message):
    # Initialisation de la session si inexistante
    if data.session_id not in sessions:
        sessions[data.session_id] = {
            "history": [],
            "patient": Patient()
        }

    session = sessions[data.session_id]
    
    try:
        # Mise à jour des données structurées du patient via le message
        session["patient"] = update_patient(session["patient"], data.message)

        # Appel à Gemini (ton service corrigé précédemment)
        response = ask_gemini(data.message, session["history"])

        # Sauvegarde dans l'historique
        session["history"].append({
            "user": data.message,
            "bot": response
        })

        return {"response": response}
    except Exception as e:
        print(f"Erreur Chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/finalize/{session_id}")
def finalize(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session expirée ou introuvable")

    session = sessions[session_id]
    patient = session["patient"]

    # Logique médicale
    patient.triage_level = evaluate_redflags(patient)

    features = [
        patient.severity or 0,
        int(patient.nausea or 0),
        int(patient.photophobia or 0),
        int(patient.neck_stiffness or 0)
    ]

    ml_result = predict(features)
    diagnosis = ml_result if ml_result else headache_protocol(patient)

    result = {
        "triage": patient.triage_level,
        "diagnosis": diagnosis,
        "summary": "Analyse terminée par JARVIS"
    }

    # Génération du PDF
    pdf_path = f"rapport_{session_id}.pdf"
    generate_pdf(result, pdf_path)
    
    # Nettoyage de la session après finalisation
    # del sessions[session_id] 

    return result
