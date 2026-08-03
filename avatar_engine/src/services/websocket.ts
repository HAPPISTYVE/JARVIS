let socket: WebSocket | null = null;
let audioUnlocked = false;

/**
 * Déverrouille l'API Web Speech lors de la première interaction utilisateur.
 * Nécessaire à cause des restrictions d'autoplay des navigateurs.
 */
export function unlockAudio() {
  if ('speechSynthesis' in window && !audioUnlocked) {
    const silentUtterance = new SpeechSynthesisUtterance('');
    window.speechSynthesis.speak(silentUtterance);
    audioUnlocked = true;
    console.log("🔊 Synthèse vocale déverrouillée.");
  }
}

/**
 * Fait lire un texte à voix haute par le navigateur.
 */
export function speak(text: string) {
  if (!('speechSynthesis' in window)) {
    console.warn("⚠️ La synthèse vocale n'est pas supportée par ce navigateur.");
    return;
  }

  // Annule la lecture en cours si JARVIS est déjà en train de parler
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR'; // Langue française
  utterance.rate = 1.0;   // Vitesse de lecture (0.1 à 10)
  utterance.pitch = 1.0;  // Hauteur de la voix (0 à 2)

  // Optionnel : Sélectionner une voix française spécifique si disponible
  const voices = window.speechSynthesis.getVoices();
  const frenchVoice = voices.find((voice) => voice.lang.includes('fr'));
  if (frenchVoice) {
    utterance.voice = frenchVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Connexion au WebSocket JARVIS
 */
export function connectWebSocket(onMessage: (data: any) => void) {
  socket = new WebSocket("wss://jarvis-api-08dr.onrender.com/ws");

  socket.onopen = () => {
    console.log("✅ Connecté backend JARVIS");
    socket?.send(
      JSON.stringify({
        type: "avatar",
        message: "Avatar connecté",
      })
    );
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      // 🔊 Récupère le texte reçu (s'adapte à data.message, data.response ou data.text)
      const textToSpeak = data.message || data.response || data.text;

      if (textToSpeak && typeof textToSpeak === 'string') {
        speak(textToSpeak);
      }

      // Transmet les données au reste de ton application
      onMessage(data);
    } catch (error) {
      console.error("Erreur lors de la lecture du JSON reçu:", error);
    }
  };

  socket.onerror = (err) => {
    console.error("❌ WebSocket erreur:", err);
  };

  socket.onclose = () => {
    console.log("🔌 Déconnecté du backend JARVIS");
    socket = null;
  };
}

/**
 * Envoie un message au WebSocket
 */
export function sendMessage(data: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else {
    console.warn("⚠️ WebSocket non prêt");
  }
}
