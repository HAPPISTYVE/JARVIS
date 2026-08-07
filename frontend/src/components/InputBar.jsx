import { Send, Mic, Refresh-Cw } from "lucide-react";
import { useState, useRef } from "react";

function InputBar({ input, setInput, onSend }) {
  const [listening, setListening] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // 🎤 Voice recognition
  const handleVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {  
      alert("Speech recognition not supported");  
      return;  
    }  

    const recognition = new SpeechRecognition();  
    recognition.lang = "en-US";  
    recognition.start();  

    setListening(true);  

    recognition.onresult = (event) => {  
      const transcript = event.results[0][0].transcript;  
      setInput(transcript);  
      setListening(false);  
    };  

    recognition.onerror = () => setListening(false);
  };

  // ➕ Ouvrir le lien Jarvis
  const handleAttachClick = () => {
    window.open("https://jarvis-w9w5.vercel.app/", "_blank", "noopener,noreferrer");
  };

  // 📨 Envoyer
  const handleSend = () => {
    onSend({ text: input, file });  
    setInput("");  
    setFile(null);
  };

  return (
    <div className="input-bar" style={{ display: "flex", flexDirection: "column" }}>
      <div className="input-wrapper" style={{ display: "flex", alignItems: "center" }}>
        
        {/* + Bouton lien Jarvis */}
        <button
          type="button"
          onClick={handleAttachClick}
          style={{ marginRight: "6px", background: "transparent", border: "none", cursor: "pointer" }}
        >
          <Plus size={23} />
        </button>

        {/* Input texte */}  
        <input
          type="text"
          placeholder="Demander à JARVIS..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: "12px 16px", height: "40px", fontSize: "16px" }}
        />

        {/* 🎤 Micro */}  
        <button type="button" onClick={handleVoice} style={{
            marginLeft: "6px",
            backgroundColor: "#f3f4f6",
            borderRadius: "50%",
            padding: "6px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>  
          <Mic size={20} color={listening ? "red" : "black"} />  
        </button>  

        {/* 📨 Send */}  
        <button onClick={handleSend} style={{
            marginLeft: "6px",
            backgroundColor: "#4f46e5",
            borderRadius: "50%",
            padding: "8px",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "white",
          }}>  
          <Send size={23} />  
        </button>  
      </div>  
    </div>
  );
}

export default InputBar;
