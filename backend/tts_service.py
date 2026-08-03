import os
import uuid
import soundfile as sf

from kokoro import KPipeline


# Initialisation du moteur Kokoro
# fr = français
pipeline = KPipeline(
    lang_code="f"
)


def generate_speech(text: str):

    try:

        filename = f"audio_{uuid.uuid4().hex}.wav"

        filepath = os.path.join(
            "audio",
            filename
        )


        # Création du dossier audio
        os.makedirs(
            "audio",
            exist_ok=True
        )


        # Voix masculine
        # bf_emma = exemple voix anglaise féminine
        # bm_george = exemple voix masculine
        # (on changera selon les voix disponibles)
        generator = pipeline(
            text,
            voice="bm_george"
        )


        audio_chunks = []


        for _, _, audio in generator:

            audio_chunks.append(audio)


        final_audio = audio_chunks[0]


        sf.write(
            filepath,
            final_audio,
            24000
        )


        return filepath



    except Exception as e:

        print(
            "Erreur TTS :",
            e
        )

        return None
