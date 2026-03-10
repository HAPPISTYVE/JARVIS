from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from models import Patient
from groq_service import ask_ai
from conversation_engine import update_patient
from redflag_engine import evaluate_redflags
from protocol_engine import headache_protocol
from ml_engine import predict
from pdf_generator import generate_pdf
from fastapi.middleware.cors import CORSMiddleware

import uvicorn

app = FastAPI(title="JARVIS Medical API")

# CORS pour React / Vercel
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

# stockage des sessions
sessions = {}

class Message(BaseModel):
    session_id: str
    message: str


# test serveur
@app.get("/")
def health_check():
    return {
        "status": "online",
        "system": "JARVIS"
    }


# chat principal
@app.post("/chat")
async def chat(data: Message):

    if len(sessions) > 100:
        sessions.clear()

    if data.session_id not in sessions:
        sessions[data.session_id] = {
            "history": [],
            "patient": Patient()
        }

    session = sessions[data.session_id]

    try:

        session["patient"] = update_patient(session["patient"], data.message)

        response = ask_ai(data.message, session["history"])

        session["history"].append({
            "user": data.message,
            "bot": response
        })

        return {"response": response}

    except Exception as e:
        print("Erreur Chat:", e)
        raise HTTPException(status_code=500, detail=str(e))


# analyse finale
@app.post("/finalize/{session_id}")
def finalize(session_id: str):

    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session introuvable")

    session = sessions[session_id]
    patient = session["patient"]

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

    pdf_path = f"rapport_{session_id}.pdf"
    generate_pdf(result, pdf_path)

    return result


# lancement local
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
