from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from models import Patient
from gemini_service import ask_gemini
from conversation_engine import update_patient
from redflag_engine import evaluate_redflags
from protocol_engine import headache_protocol
from ml_engine import predict, train_model
from dataset_manager import add_case
from pdf_generator import generate_pdf
from voice_service import speech_to_text
import uuid, shutil, os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
sessions = {}

class Message(BaseModel):
    session_id: str
    message: str

@app.post("/chat")
def chat(data: Message):

    if data.session_id not in sessions:
        sessions[data.session_id] = {
            "history": [],
            "patient": Patient()
        }

    session = sessions[data.session_id]
    session["patient"] = update_patient(session["patient"], data.message)

    response = ask_gemini(data.message, session["history"])

    session["history"].append({
        "user": data.message,
        "bot": response
    })

    return {"response": response}

@app.post("/voice")
def voice_input(file: UploadFile = File(...)):

    file_location = f"temp_{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = speech_to_text(file_location)
    os.remove(file_location)

    return {"text": text}

@app.post("/finalize/{session_id}")
def finalize(session_id: str):

    session = sessions[session_id]
    patient = session["patient"]

    patient.triage_level = evaluate_redflags(patient)

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

    del sessions[session_id]

    return result



