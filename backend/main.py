from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from models import Patient
from groq_service import ask_groq
from conversation_engine import update_patient
from redflag_engine import evaluate_redflags
from protocol_engine import headache_protocol
from ml_engine import predict
from pdf_generator import generate_pdf
from voice_service import speech_to_text
from fastapi.middleware.cors import CORSMiddleware
import shutil, os
import uvicorn

app = FastAPI(title="JARVIS Medical API")

# --- CORS pour React ---
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

# --- Modèle pour la requête chat ---
class Message(BaseModel):
    session_id: str
    message: str

# --- Health Check ---
@app.get("/")
def health():
    return {"status": "online", "system": "JARVIS"}

# --- Chat endpoint ---
@app.post("/chat")
def chat(data: Message):
    if data.session_id not in sessions:
        sessions[data.session_id] = {
            "history": [],
            "patient": Patient()
        }

    session = sessions[data.session_id]

    try:
        # Mise à jour patient
        session["patient"] = update_patient(session["patient"], data.message)

        # Appel à Groq
        response = ask_groq(data.message, session["history"])

        # Sauvegarde dans l'historique
        session["history"].append({
            "user": data.message,
            "bot": response
        })

        return {"response": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Voice endpoint ---
@app.post("/voice")
def voice_input(file: UploadFile = File(...)):
    """
    Reçoit un fichier audio et renvoie le texte reconnu
    """
    try:
        file_location = f"temp_{file.filename}"

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        text = speech_to_text(file_location)
        os.remove(file_location)

        if text is None:
            return {"text": "", "error": "Impossible de reconnaître le texte"}

        return {"text": text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Finalize endpoint ---
@app.post("/finalize/{session_id}")
def finalize(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session introuvable")

    session = sessions[session_id]
    patient = session["patient"]

    # Triage
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
        "diagnosis": diagnosis
    }

    pdf_path = f"rapport_{session_id}.pdf"
    generate_pdf(result, pdf_path)

    return result


# --- Run server ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
