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
<div className="input-bar">
<div className="input-wrapper">

<input  
    type="text"  
    placeholder="Demander à JARVIS..."  
    value={input}  
    onChange={(e) => setInput(e.target.value)}  
  />  
  <button type="button" className="mic-btn" onClick={handleVoice}>  
    <Mic size={18} color={listening ? "red" : "black"} />  
  </button>  
  </div>  

  <button className="send-btn" onClick={onSend}>  
    <Send size={18} />  
  </button>  

  
</div>

);
}

export default InputBar;

