from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from models import Patient
from groq_service import ask_groq
from conversation_engine import update_patient
from redflag_engine import evaluate_redflags
from protocol_engine import headache_protocol
from ml_engine import predict
from pdf_generator import generate_pdf
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

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
def health():
    return {"status": "online", "system": "JARVIS"}


@app.post("/chat")
def chat(data: Message):

    if data.session_id not in sessions:
        sessions[data.session_id] = {
            "history": [],
            "patient": Patient()
        }

    session = sessions[data.session_id]

    try:
        session["patient"] = update_patient(session["patient"], data.message)

        response = ask_groq(data.message, session["history"])

        session["history"].append({
            "user": data.message,
            "bot": response
        })

        return {"response": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
        "diagnosis": diagnosis
    }

    generate_pdf(result, f"rapport_{session_id}.pdf")

    return result


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
