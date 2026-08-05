import { GaussianAvatar } from "./gaussianAvatar";
import { connectWebSocket, sendMessage } from "./services/websocket";
import { startAutoListening } from "./services/speech";

console.log("🔥 JARVIS AUTO VOICE VERSION (Strict iOS / Safari Fixes)");

const div = document.getElementById("LAM_WebRender") as HTMLDivElement;
const assetPath = "./asset/arkit/p2-1.zip";

const gaussianAvatar = new GaussianAvatar(div, assetPath);
gaussianAvatar.start();

// Variables globales
let isAudioUnlocked = false;
let currentUtterance: SpeechSynthesisUtterance | null = null; // Fix pour le Garbage Collection iOS
let selectedVoice: SpeechSynthesisVoice | null = null;

/**
 * Charge la voix FR en amont
 */
function loadVoices(): void {
  if (!("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices();
  selectedVoice =
    voices.find((v) => v.lang === "fr-FR" || v.lang.startsWith("fr")) || null;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * Déverrouille l'API Web Speech & Web Audio sur iOS
 */
function unlockAudio(): void {
  if (isAudioUnlocked) return;

  if ("speechSynthesis" in window) {
    // 1. Déblocage SpeechSynthesis
    const dummyUtterance = new SpeechSynthesisUtterance(" ");
    dummyUtterance.volume = 0.01;
    window.speechSynthesis.speak(dummyUtterance);

    // 2. Déblocage Web Audio (garde le canal audio d'iOS actif)
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioCtx = new AudioContext();
        const buffer = audioCtx.createBuffer(1, 1, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start(0);
      }
    } catch (e) {
      console.warn("Web Audio non disponible pour le déblocage", e);
    }

    isAudioUnlocked = true;
    console.log("🔓 Audio iOS Safari totalement débloqué !");
  }
}

// Écouteurs globaux pour débloquer dès le 1er geste utilisateur
window.addEventListener("click", unlockAudio, { once: true });
window.addEventListener("touchstart", unlockAudio, { once: true });

// ===============================
// TTS (Text-to-Speech)
// ===============================

function speak(text: string): void {
  if (!text || !("speechSynthesis" in window)) return;

  console.log("🔊 Préparation de la lecture :", text);

  // Tenter de débloquer si ce n'est pas déjà fait
  unlockAudio();

  // Relance le moteur s'il est en pause (bug classique Safari)
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  // Stopper la lecture précédente
  window.speechSynthesis.cancel();

  // Création de l'instance
  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = "fr-FR";
  currentUtterance.rate = 1.0;
  currentUtterance.pitch = 1.0;
  currentUtterance.volume = 1.0;

  if (selectedVoice) {
    currentUtterance.voice = selectedVoice;
  }

  // Événements
  currentUtterance.onstart = () => {
    console.log("🗣️ JARVIS parle");
    gaussianAvatar.setChatState("Speaking");
  };

  currentUtterance.onend = () => {
    console.log("🎧 Retour écoute");
    gaussianAvatar.setChatState("Listening");
    currentUtterance = null; // Libération après lecture complète
  };

  currentUtterance.onerror = (event) => {
    console.error("❌ Erreur de synthèse vocale :", event);
    gaussianAvatar.setChatState("Listening");
    currentUtterance = null;
  };

  // Traitement spécifique Safari/iOS : Contournement du problème de thread
  setTimeout(() => {
    if (currentUtterance) {
      window.speechSynthesis.speak(currentUtterance);
    }
  }, 100);
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
  unlockAudio();

  console.log("🚀 Envoi automatique :", text);

  sendMessage({
    type: "user_message",
    text: text,
  });
});
