from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from models import Patient
# from gemini_service import ask_gemini  # temporairement désactivé pour test
from conversation_engine import update_patient
from redflag_engine import evaluate_redflags
from protocol_engine import headache_protocol
from ml_engine import predict, train_model
from dataset_manager import add_case
from pdf_generator import generate_pdf
from voice_service import speech_to_text
import uuid, shutil, os
from fastapi.middleware.cors import CORSMiddleware

# ----------------------------
# INITIALISATION FASTAPI
# ----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # autorise tout pour test
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions = {}

# ----------------------------
# MODELS
# ----------------------------
class Message(BaseModel):
    session_id: str
    message: str

# ----------------------------
# ROUTE /chat
# ----------------------------
@app.post("/chat")
def chat(data: Message):
    print("=== Nouveau message reçu ===")
    print(data.dict())  # log pour voir ce qui arrive

    # Création session si pas existante
    if data.session_id not in sessions:
        sessions[data.session_id] = {
            "history": [],
            "patient": Patient()
        }

    session = sessions[data.session_id]

    # Mettre à jour le patient
    session["patient"] = update_patient(session["patient"], data.message)

    # ----------------------------
    # TEMPORAIRE : réponse dynamique pour test
    # ----------------------------
    response = f"Tu as dit : {data.message}"
    # response = ask_gemini(data.message, session["history"])  # réactiver plus tard

    print("=== Réponse envoyée ===")
    print(response)

    # Ajout dans l'historique
    session["history"].append({
        "user": data.message,
        "bot": response
    })

    return {"response": response}

# ----------------------------
# ROUTE /voice
# ----------------------------
@app.post("/voice")
def voice_input(file: UploadFile = File(...)):
    file_location = f"temp_{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = speech_to_text(file_location)
    os.remove(file_location)

    return {"text": text}

# ----------------------------
# ROUTE /finalize/{session_id}
# ----------------------------
@app.post("/finalize/{session_id}")
def finalize(session_id: str):
    if session_id not in sessions:
        return {"error": "Session non trouvée"}

    session = sessions[session_id]
    patient = session["patient"]

    # évaluation triage
    patient.triage_level = evaluate_redflags(patient)

    # features pour ML
    features = [
        patient.severity or 0,
        int(patient.nausea),
        int(patient.photophobia),
        int(patient.neck_stiffness)
    ]

    ml_result = predict(features)

    if ml_result:
        diagnosis = ml_result
    else:
        diagnosis = headache_protocol(patient)

    result = {
        "triage": patient.triage_level,
        "diagnosis": diagnosis
    }

    generate_pdf(result, f"rapport_{session_id}.pdf")

    # suppression session
    del sessions[session_id]

    return result
