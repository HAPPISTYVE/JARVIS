import google.generativeai as genai

genai.configure(api_key="AIzaSyAZQtN1Pp0RhfwzeEkQ4oe3Ek2Rf7RCGx0")

model = genai.GenerativeModel("gemini-1.5-flash")

def ask_gemini(message, history):

    try:
        response = model.generate_content(message)
        return response.text
    except Exception as e:
        return str(e)
