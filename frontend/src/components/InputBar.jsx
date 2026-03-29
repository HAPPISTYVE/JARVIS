import { Send, Mic } from "lucide-react";
import { useState, useRef } from "react";

function InputBar({ input, setInput, onSend }) {
const [listening, setListening] = useState(false);

// 🆕 fichier
const [file, setFile] = useState(null);
const fileInputRef = useRef(null);

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

// 🆕 ouvrir sélection fichier
const handleAttachClick = () => {
fileInputRef.current.click();
};

return (
<div className="input-bar">
<div className="input-wrapper">

{/* 📎 Trombone */}  
    <span  
      onClick={handleAttachClick}  
      style={{ cursor: "pointer", marginRight: "6px" }}  
    >  
      📎  
    </span>  

    {/* Input caché */}  
    <input  
      type="file"  
      ref={fileInputRef}  
      style={{ display: "none" }}  
      onChange={(e) => setFile(e.target.files[0])}  
      accept="image/*,.pdf,.txt"  
    />  

    {/* Input texte */}  
    <input  
      type="text"  
      placeholder="Demander à JARVIS..."  
      value={input}  
      onChange={(e) => setInput(e.target.value)}  
    />  

    {/* 🎤 Micro */}  
    <button type="button" className="mic-btn" onClick={handleVoice}>  
      <Mic size={18} color={listening ? "red" : "black"} />  
    </button>  
  </div>  

  {/* 📎 Preview fichier (optionnel mais utile) */}  
  {file && (  
    <div style={{ fontSize: "12px", marginTop: "4px" }}>  
      📎 {file.name}  
    </div>  
  )}  

  {/* 📨 Send */}  
  <button  
    className="send-btn"  
    onClick={() => {  
      onSend(file); // 🆕 on envoie fichier aussi  
      setFile(null); // reset après envoi  
    }}  
  >  
    <Send size={18} />  
  </button>  
</div>

);
}

export default InputBar;

Je suis entrain de faire le trombone comme le micro ques qui manque on me parle de parent
