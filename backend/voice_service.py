import speech_recognition as sr

def speech_to_text(audio_file_path):

    recognizer = sr.Recognizer()

    with sr.AudioFile(audio_file_path) as source:
        audio = recognizer.record(source)

    try:
        text = recognizer.recognize_google(audio, language="fr-FR")
        return text
    except:
        return None

