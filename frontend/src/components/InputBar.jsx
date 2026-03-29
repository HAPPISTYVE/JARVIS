import {Send, Mic } from "lucide-react";
import { useState } from "react";

function InputBar({ input, setInput, onSend }) {
const [listening, setListening] = useState(false);

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

recognition.onerror = () => {  
  setListening(false);  
};

};
 

  return (
    <div className="input-bar" style={{ display: "flex", flexDirection: "column" }}>
      <div className="input-wrapper" style={{ display: "flex", alignItems: "center" }}>
        {/* + Bouton fichiers */}
        <button
          type="button"
          onClick={handleAttachClick}
          style={{
            marginRight: "6px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus size={20} />
        </button>

        {/* Input caché fichiers */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={(e) => setFile(e.target.files[0])}
          accept="image/*,.pdf,.txt"
        />
  
return (
<div className="input-bar">
<div className="input-wrapper">

<input  
    type="text"  
    placeholder="Demander à JARVIS..."  
    value={input}  
    onChange={(e) => setInput(e.target.value)}  
  />  
  
  </div>  

 <button
          type="button"
          onClick={handleVoice}
          style={{
            marginLeft: "6px",
            backgroundColor: "#f3f4f6",
            borderRadius: "50%",
            padding: "6px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Mic size={18} color={listening ? "red" : "black"} />
        </button>


{/* 📨 Send en bulle */}
        <button
          onClick={handleSend}
          style={{
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
          }}
        >
          <Send size={18} />
        </button>
      

  

  
</div>

);
}

export default InputBar;
