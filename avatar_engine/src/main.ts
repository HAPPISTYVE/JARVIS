import { GaussianAvatar } from "./gaussianAvatar";
import { connectWebSocket, sendMessage } from "./services/websocket";
import { startAutoListening } from "./services/speech";

console.log("🔥 JARVIS AUTO VOICE VERSION");

const div = document.getElementById("LAM_WebRender") as HTMLDivElement;
const assetPath = "./asset/arkit/p2-1.zip";

const gaussianAvatar = new GaussianAvatar(div, assetPath);
gaussianAvatar.start();

// Variable pour vérifier si l'audio a été débloqué par le navigateur
let isAudioUnlocked = false;

/**
 * Déverrouille l'API SpeechSynthesis suite à un geste utilisateur.
 * Obligatoire pour contourner la politique d'Autoplay des navigateurs.
 */
function unlockAudio(): void {
  if (isAudioUnlocked) return;

  // Émettre une phrase vide pour activer le moteur vocal
  const utterance = new SpeechSynthesisUtterance("");
  window.speechSynthesis.speak(utterance);
  isAudioUnlocked = true;
  console.log("🔓 Audio débloqué par l'utilisateur !");
}

// Débloquer l'audio au premier clic sur la page
window.addEventListener("click", unlockAudio, { once: true });
window.addEventListener("touchstart", unlockAudio, { once: true });

// ===============================
// TTS (Text-to-Speech)
// ===============================

function speak(text: string): void {
  console.log("🔊 Lecture :", text);

  if (!text) return;

  // Si l'utilisateur n'a pas encore cliqué, débloquer au moment où la voix doit parler
  unlockAudio();

  // Annuler les lectures en cours avant d'en lancer une nouvelle
  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "fr-FR";
  speech.rate = 1;
  speech.pitch = 1;
  speech.volume = 1;

  // Récupérer et forcer une voix française disponible dans le navigateur
  const voices = window.speechSynthesis.getVoices();
  const frVoice = voices.find((v) => v.lang.includes("fr-FR"));
  if (frVoice) {
    speech.voice = frVoice;
  }

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

  window.speechSynthesis.speak(speech);
}

// Charger les voix en arrière-plan (nécessaire sur Chrome)
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

// ===============================
// WEBSOCKET
// ===============================

connectWebSocket((data: { type: string; data?: any; state?: any; text?: string }) => {
  console.log("📩", data);

  switch (data.type) {
    case "blendshapes":
      gaussianAvatar.updateBlendshapes(data.data);
      break;

    case "state":
      gaussianAvatar.setChatState(data.state);
      break;

    case "response":
      console.log("Reponse recu",data)
      if (data.text) {
        speak(data.text);
      }
      break;
  }
});

// ===============================
// MICRO AUTOMATIQUE
// ===============================

startAutoListening((text: string) => {
  // L'utilisateur vient de parler (donc interaction valide) -> Débloquer l'audio si ce n'est pas fait
  unlockAudio();

  console.log("🚀 Envoi automatique :", text);

  sendMessage({
    type: "user_message",
    text: text,
  });
});
