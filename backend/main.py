from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
import shutil, os, uvicorn

from models import Patient
from groq_service import ask_groq, warmup
from conversation_engine import update_patient
from redflag_engine import evaluate_redflags
from protocol_engine import headache_protocol
from ml_engine import predict
from pdf_generator import generate_pdf
from voice_service import speech_to_text


# ✅ Lifespan = exécuté dans chaque worker
@asynccontextmanager
async def lifespan(app: FastAPI):
    warmup()
    yield


app = FastAPI(
    title="JARVIS Medical API",
    lifespan=lifespan
)


# --- CORS React ---
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


# ===========================
# WebSocket Avatar
# ===========================

connected_clients = []


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()

    connected_clients.append(websocket)

    print("✅ Avatar connecté")

    try:
        while True:

            data = await websocket.receive_json()

            print("Message avatar reçu :", data)

            await websocket.send_json({
                "type": "state",
                "state": "Listening"
            })


    except WebSocketDisconnect:

        print("❌ Avatar déconnecté")

        if websocket in connected_clients:
            connected_clients.remove(websocket)



async def send_avatar(data: dict):

    disconnected = []

    for client in connected_clients:

        try:
            await client.send_json(data)

        except Exception:
            disconnected.append(client)


    for client in disconnected:

        if client in connected_clients:
            connected_clients.remove(client)



# ===========================
# Models
# ===========================

class Message(BaseModel):

    session_id: str
    message: str



# ===========================
# Health Check
# ===========================

@app.get("/")
def health():

    return {
        "status": "online",
        "system": "JARVIS"
    }



# ===========================
# Chat endpoint
# ===========================

@app.post("/chat")
async def chat(data: Message):

    if data.session_id not in sessions:

        sessions[data.session_id] = {
            "history": [],
            "patient": Patient()
        }


    session = sessions[data.session_id]


    try:

        # Avatar réfléchit
        await send_avatar({
            "type": "state",
            "state": "Thinking"
        })


        # Analyse patient
        session["patient"] = update_patient(
            session["patient"],
            data.message
        )


        # Appel IA
        response = ask_groq(
            data.message,
            session["history"]
        )


        # Avatar parle
        await send_avatar({
            "type": "state",
            "state": "Speaking"
        })


        session["history"].append({

            "user": data.message,
            "bot": response

        })


        # Avatar attend
        await send_avatar({

            "type": "state",
            "state": "Listening"

        })


        return {

            "response": response

        }



    except Exception as e:


        await send_avatar({

            "type": "state",
            "state": "Listening"

        })


        raise HTTPException(

            status_code=500,
            detail=str(e)

        )
        



@app.post("/voice")
def voice_input(file: UploadFile = File(...)):

    try:

        file_location = f"temp_{file.filename}"


        with open(file_location, "wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )


        text = speech_to_text(file_location)


        os.remove(file_location)



        if text is None:

            return {

                "text": "",
                "error": "Impossible de reconnaître le texte"

            }



        return {

            "text": text

        }



    except Exception as e:


        raise HTTPException(

            status_code=500,
            detail=str(e)

        )



# ===========================
# Finalize endpoint
# ===========================

@app.post("/finalize/{session_id}")
def finalize(session_id: str):


    if session_id not in sessions:

        raise HTTPException(

            status_code=404,
            detail="Session introuvable"

        )


    session = sessions[session_id]


    patient = session["patient"]



    # Evaluation médicale

    patient.triage_level = evaluate_redflags(patient)



    features = [

        patient.severity or 0,

        int(patient.nausea or 0),

        int(patient.photophobia or 0),

        int(patient.neck_stiffness or 0)

    ]



    ml_result = predict(features)



    diagnosis = (

        ml_result

        if ml_result

        else headache_protocol(patient)

    )



    result = {


        "triage": patient.triage_level,

        "diagnosis": diagnosis


    }



    pdf_path = f"rapport_{session_id}.pdf"



    generate_pdf(

        result,

        pdf_path

    )



    return result




# ===========================
# Run server
# ===========================

if __name__ == "__main__":


    port = int(

        os.environ.get(

            "PORT",

            8000

        )

    )



    uvicorn.run(

        app,

        host="0.0.0.0",

        port=port

    )
