import { GaussianAvatar } from "./gaussianAvatar";
import { connectWebSocket, sendMessage } from "./services/websocket";
import { startAutoListening } from "./services/speech"; // Assurez-vous d'avoir une fonction stopAutoListening ou similaire si possible

console.log("🔥 JARVIS AUTO VOICE VERSION (Strict iOS / Safari Fixes v2)");

const div = document.getElementById("LAM_WebRender") as HTMLDivElement;
const assetPath = "./asset/arkit/p2-1.zip";

const gaussianAvatar = new GaussianAvatar(div, assetPath);
gaussianAvatar.start();

let isAudioUnlocked = false;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let selectedVoice: SpeechSynthesisVoice | null = null;
let keepAliveTimer: any = null;

/**
 * Nettoie le texte pour éviter que Safari iOS plante sur des caractères spéciaux (espaces insecables, etc.)
 */
function cleanTextForiOS(text: string): string {
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Enlève les caractères invisibles
    .replace(/\u202F|\u00A0/g, " ")       // Remplace les espaces incécables par des espaces simples
    .trim();
}

/**
 * Force les voix à se charger dans Safari
 */
function loadVoices(): void {
  if (!("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices();
  // Cherche la voix française officielle d'iOS (ex: Thomas, Audrey ou fr-FR)
  selectedVoice = voices.find((v) => v.lang.includes("fr") || v.lang.includes("FR")) || null;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * Déverrouille le sous-système Audio iOS
 */
function unlockAudio(): void {
  if (isAudioUnlocked) return;

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    
    // Utterance silencieuse
    const dummy = new SpeechSynthesisUtterance(" ");
    dummy.volume = 0.01;
    window.speechSynthesis.speak(dummy);

    // AudioContext pour forcer Safari à garder la session audio ouverte
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioCtx = new AudioContext();
        if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }
        const buffer = audioCtx.createBuffer(1, 1, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start(0);
      }
    } catch (e) {
      console.warn("Web Audio non initialisé", e);
    }

    isAudioUnlocked = true;
    console.log("🔓 Audio iOS Safari totalement débloqué !");
  }
}

window.addEventListener("click", unlockAudio, { once: true });
window.addEventListener("touchstart", unlockAudio, { once: true });

// ===============================
// TTS (Text-to-Speech)
// ===============================

function speak(rawText: string): void {
  if (!rawText || !("speechSynthesis" in window)) return;

  const text = cleanTextForiOS(rawText);
  console.log("🔊 Préparation de la lecture (nettoyée) :", text);

  unlockAudio();

  // Re-déclencher les voix si pas encore prêtes
  if (!selectedVoice) loadVoices();

  // Annuler toute lecture en cours
  window.speechSynthesis.cancel();
  clearInterval(keepAliveTimer);

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

    // HACK SAFARI : Évite que Safari coupe le son après 15 secondes
    keepAliveTimer = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(keepAliveTimer);
      } else {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 5000);
  };

  currentUtterance.onend = () => {
    console.log("🎧 Fin de parole -> Retour écoute");
    clearInterval(keepAliveTimer);
    gaussianAvatar.setChatState("Listening");
    currentUtterance = null;
  };

  currentUtterance.onerror = (event) => {
    console.error("❌ Erreur de synthèse vocale Safari :", event);
    clearInterval(keepAliveTimer);
    gaussianAvatar.setChatState("Listening");
    currentUtterance = null;
  };

  // Safari demande un délai d'au moins 150ms-200ms lors d'un appel via WebSocket/Asynchrone
  setTimeout(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.speak(currentUtterance!);
  }, 200);
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
