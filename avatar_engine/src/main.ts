import { GaussianAvatar } from "./gaussianAvatar";
import { connectWebSocket, sendMessage } from "./services/websocket";
import { startAutoListening } from "./services/speech";

console.log("🔥 JARVIS AUTO VOICE VERSION (Strict iOS Async Fix)");

const div = document.getElementById("LAM_WebRender") as HTMLDivElement;
const assetPath = "./asset/arkit/p2-1.zip";

const gaussianAvatar = new GaussianAvatar(div, assetPath);
gaussianAvatar.start();

let isAudioUnlocked = false;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let selectedVoice: SpeechSynthesisVoice | null = null;
let audioElement: HTMLAudioElement | null = null;

// Clean text
function cleanTextForiOS(text: string): string {
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\u202F|\u00A0/g, " ")
    .trim();
}

function loadVoices(): void {
  if (!("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices();
  selectedVoice = voices.find((v) => v.lang.includes("fr") || v.lang.includes("FR")) || null;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * Prépare et débloque le canal audio via HTMLAudioElement (nécessaire sur iOS)
 */
function unlockAudio(): void {
  if (isAudioUnlocked) return;

  // 1. Création d'une balise audio muette pour capturer le canal audio iOS
  if (!audioElement) {
    audioElement = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
  }
  
  audioElement.play().then(() => {
    console.log("🔓 Canal audio HTML5 débloqué !");
  }).catch(() => {});

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const dummy = new SpeechSynthesisUtterance("a");
    dummy.volume = 0.001;
    window.speechSynthesis.speak(dummy);
  }

  isAudioUnlocked = true;
  console.log("🔓 Audio iOS Safari totalement débloqué !");
}

window.addEventListener("click", unlockAudio, { once: true });
window.addEventListener("touchstart", unlockAudio, { once: true });

// ===============================
// TTS (Text-to-Speech)
// ===============================

function speak(rawText: string): void {
  if (!rawText || !("speechSynthesis" in window)) return;

  const text = cleanTextForiOS(rawText);
  console.log("🔊 Préparation de la lecture :", text);

  unlockAudio();

  // FIX iOS CRUCIAL : Relancer la balise audio muette juste avant le speak
  // pour réveiller le moteur audio d'iOS réendormi par l'attente réseau WebSocket
  if (audioElement) {
    audioElement.play().catch(() => {});
  }

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.lang = "fr-FR";
  currentUtterance.rate = 1.0;
  currentUtterance.pitch = 1.0;
  currentUtterance.volume = 1.0;

  if (selectedVoice) {
    currentUtterance.voice = selectedVoice;
  }

  currentUtterance.onstart = () => {
    console.log("🗣️ JARVIS parle...");
    gaussianAvatar.setChatState("Speaking");
  };

  currentUtterance.onend = () => {
    console.log("🎧 Fin de parole -> Retour écoute");
    gaussianAvatar.setChatState("Listening");
    currentUtterance = null;
  };

  currentUtterance.onerror = (event) => {
    console.error("❌ Erreur de synthèse vocale Safari :", event);
    gaussianAvatar.setChatState("Listening");
    currentUtterance = null;
  };

  // ASTUCE SAFARI iOS : Forcer une réinitialisation du singleton speechSynthesis
  window.speechSynthesis.resume();
  
  setTimeout(() => {
    window.speechSynthesis.speak(currentUtterance!);
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
  unlockAudio();

  console.log("🚀 Envoi automatique :", text);

  sendMessage({
    type: "user_message",
    text: text,
  });
});
