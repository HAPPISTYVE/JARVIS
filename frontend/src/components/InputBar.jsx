import { Send, Mic, Plus } from "lucide-react";
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
    recognition.onend = () => setListening(false); // S'assure que l'état listening revient à false
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
    <div className="input-bar" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
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
          style={{ flex: 1, padding: "6px 8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />

        {/* 🎤 Micro */}
        <button
          type="button"
          onClick={handleVoice}
          style={{ marginLeft: "6px", background: "transparent", border: "none", cursor: "pointer" }}
        >
          <Mic size={18} color={listening ? "red" : "black"} />
        </button>

        {/* 📨 Send */}
        <button
          type="button"
          onClick={handleSend}
          style={{ marginLeft: "6px", background: "transparent", border: "none", cursor: "pointer" }}
        >
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
