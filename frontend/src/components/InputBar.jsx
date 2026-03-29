import { Send, Mic, Plus } from "lucide-react";
import { useState, useRef } from "react";

function InputBar({ onSend }) {
  const [input, setInput] = useState("");
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

  // ➕ Ouvrir sélecteur fichiers
  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  // 📨 Envoyer
  const handleSend = () => {
    if (!input.trim() && !file) return;

    onSend({ text: input, file });
    setInput("");
    setFile(null);
  };

  return (
    <div className="input-bar" style={{ display: "flex", flexDirection: "column" }}>
      <div className="input-wrapper" style={{ display: "flex", alignItems: "center" }}>
        {/* + Bouton fichiers */}
        <button
          type="button"
          onClick={handleAttachClick}
          style={{ marginRight: "6px", background: "transparent", border: "none", cursor: "pointer" }}
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

        {/* Input texte */}
        <input
          type="text"
          placeholder="Demander à JARVIS..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: "6px 8px" }}
        />

        {/* 🎤 Micro */}
        <button type="button" onClick={handleVoice} style={{ marginLeft: "6px" }}>
          <Mic size={18} color={listening ? "red" : "black"} />
        </button>

        {/* 📨 Send */}
        <button onClick={handleSend} style={{ marginLeft: "6px" }}>
          <Send size={18} />
        </button>
      </div>

      {/* Preview fichier */}
      {file && (
        <div style={{ fontSize: "12px", marginTop: "4px" }}>
          📎 {file.name}
        </div>
      )}
    </div>
  );
}

export default InputBar;
