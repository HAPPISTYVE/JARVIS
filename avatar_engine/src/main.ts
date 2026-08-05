import { GaussianAvatar } from "./gaussianAvatar";
import { connectWebSocket, sendMessage } from "./services/websocket";
import { startAutoListening } from "./services/speech";

console.log("🔥 JARVIS AUTO VOICE VERSION (Optimisé iOS / Safari / Chrome)");

const div = document.getElementById("LAM_WebRender") as HTMLDivElement;
const assetPath = "./asset/arkit/p2-1.zip";

const gaussianAvatar = new GaussianAvatar(div, assetPath);
gaussianAvatar.start();

// Variable pour suivre le déblocage audio iOS
let isAudioUnlocked = false;

/**
 * Déverrouille l'API SpeechSynthesis sur iOS suite à une action utilisateur.
 */
function unlockAudio(): void {
  if (isAudioUnlocked) return;

  if ("speechSynthesis" in window) {
    // Un espace " " (et non "") force iOS à réveiller la synthèse vocale
    const utterance = new SpeechSynthesisUtterance(" ");
    utterance.volume = 0.01; // Inaudible pour l'utilisateur
    window.speechSynthesis.speak(utterance);

    isAudioUnlocked = true;
    console.log("🔓 Audio iOS débloqué !");
  }
}

// Débloquer au premier clic ou premier toucher sur iPhone
window.addEventListener("click", unlockAudio, { once: true });
window.addEventListener("touchstart", unlockAudio, { once: true });

// Charger les voix en mémoire dès que possible (requis sur iOS/Chrome)
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

// ===============================
// TTS (Text-to-Speech)
// ===============================

function speak(text: string): void {
  if (!text || !("speechSynthesis" in window)) return;

  console.log("🔊 Préparation de la lecture :", text);

  // S'assurer que l'audio a bien été débloqué
  unlockAudio();

  // Si le moteur audio d'iOS s'est mis en pause, on le relance
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  // Ne faire cancel() QUE si une lecture est réellement déjà en cours
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "fr-FR";
  speech.rate = 1.0;
  speech.pitch = 1.0;
  speech.volume = 1.0;

  // Récupérer et forcer la meilleure voix française disponible sur l'iPhone
  const voices = window.speechSynthesis.getVoices();
  const frVoice = voices.find((v) => v.lang.startsWith("fr") || v.lang.includes("FR"));
  if (frVoice) {
    speech.voice = frVoice;
  }

  // ⚠️ CRUCIAL : Les événements DOIVENT être rattachés AVANT d'appeler speak()
  speech.onstart = () => {
    console.log("🗣️ JARVIS parle");
    gaussianAvatar.setChatState("Speaking");
  };

  speech.onend = () => {
    console.log("🎧 Retour écoute");
    gaussianAvatar.setChatState("Listening");
  };

  speech.onerror = (event) => {
    console.error("❌ Erreur de synthèse vocale :", event);
    gaussianAvatar.setChatState("Listening");
  };

  // Petit délai de 50ms pour laisser le temps au moteur audio iOS d'être prêt
  setTimeout(() => {
    window.speechSynthesis.speak(speech);
  }, 50);
}

// ===============================
// WEBSOCKET
// ===============================

connectWebSocket(
  (data: { type: string; data?: any; state?: any; text?: string }) => {
    console.log("📩 Données reçues :", data);

    switch (data.type) {
      case "blendshapes":
        gaussianAvatar.updateBlendshapes(data.data);
        break;

      case "state":
        gaussianAvatar.setChatState(data.state);
        break;

      case "response":
        console.log("Réponse reçue :", data);
        if (data.text) {
          speak(data.text);
        }
        break;
    }
  }
);

// ===============================
// MICRO AUTOMATIQUE
// ===============================

startAutoListening((text: string) => {
  // L'utilisateur a interagi vocalement -> Valider l'interaction audio
  unlockAudio();

  console.log("🚀 Envoi automatique :", text);

  sendMessage({
    type: "user_message",
    text: text,
  });
});
