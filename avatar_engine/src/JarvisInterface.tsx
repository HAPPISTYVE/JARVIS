import React, { useState, useRef } from 'react';

// Assure-toi que cette URL correspond au port de ton backend FastAPI
const API_BASE_URL = "http://localhost:8000"; 

export default function JarvisInterface() {
  // Générer un session_id unique pour le patient à la connexion
  const [sessionId] = useState(() => "session_" + Math.random().toString(36).substring(2, 9));
  const [message, setMessage] = useState("");
  const [chatHistory, setHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- 1. ENVOI DE MESSAGE TEXTE (/chat) ---
  const sendMessage = async () => {
    if (!message.trim()) return;

    const currentUserMsg = { sender: 'user', text: message };
    const newHistory = [...chatHistory, currentUserMsg];
    
    setHistory(newHistory);
    setMessage("");
    setIsProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: currentUserMsg.text
        })
      });

      if (!response.ok) throw new Error("Erreur réseau");
      
      const data = await response.json();
      
      // Ajout de la réponse de JARVIS à l'historique
      setHistory([...newHistory, { sender: 'jarvis', text: data.response }]);

      // 🔴 C'EST ICI QUE TU CONNECTES L'ANIMATION 3D 🔴
      // Exemple : triggerAvatarSpeech(data.response);
      
    } catch (error) {
      console.error("Erreur lors de la communication avec Jarvis:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 2. ENVOI D'AUDIO (/voice) ---
  // Cette fonction est à appeler avec le Blob audio généré par le micro de l'utilisateur
  const sendVoiceMessage = async (audioBlob) => {
    setIsProcessing(true);
    const formData = new FormData();
    // Le backend attend un UploadFile nommé "file"
    formData.append("file", audioBlob, "voice_input.wav"); 

    try {
      const response = await fetch(`${API_BASE_URL}/voice`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.text) {
        // Le texte a été reconnu, tu peux soit l'afficher, soit l'envoyer directement au chat
        setMessage(data.text);
        // Optionnel: déclencher sendMessage() automatiquement ici
      } else if (data.error) {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi vocal:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 3. FINALISATION ET RAPPORT (/finalize) ---
  const finalizeSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/finalize/${sessionId}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      console.log("Diagnostic final:", data);
      alert(`Diagnostic: ${data.diagnosis} \vert{} Triage:${data.triage}`);
      
    } catch (error) {
      console.error("Erreur lors de la finalisation:", error);
    }
  };

  return (
    <div className="jarvis-container">
      <div className="avatar-3d-placeholder">
        {/* Intègre ton Canvas Three.js / React Three Fiber ici */}
      </div>

      <div className="chat-box">
        <div className="history">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <strong>{msg.sender === 'user' ? 'Vous' : 'JARVIS'}: </strong>
              {msg.text}
            </div>
          ))}
          {isProcessing && <div className="loading">JARVIS réfléchit...</div>}
        </div>

        <div className="input-area">
          <input 
            type="text" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Décrivez vos symptômes..."
            disabled={isProcessing}
          />
          <button onClick={sendMessage} disabled={isProcessing}>Envoyer</button>
          
          {/* Bouton pour simuler la finalisation */}
          <button onClick={finalizeSession}>Générer Rapport</button>
        </div>
      </div>
    </div>
  );
}
