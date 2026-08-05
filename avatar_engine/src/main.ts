import { GaussianAvatar } from './gaussianAvatar';
import { connectWebSocket, sendMessage } from './services/websocket';
import { startAutoListening } from './services/speech';

console.log('🔥 JARVIS iOS FIX VERSION');

const div = document.getElementById('LAM_WebRender') as HTMLDivElement;
const assetPath = './asset/arkit/p2-1.zip';

const gaussianAvatar = new GaussianAvatar(div, assetPath);
gaussianAvatar.start();

let selectedVoice: SpeechSynthesisVoice | null = null;
let stopListening: (() => void) | null = null;
let startListeningAgain: (() => void) | null = null;

// ------------------------------
// Charger les voix Safari
// ------------------------------
function loadVoices() {
  const voices = window.speechSynthesis.getVoices();
  console.log('Voices:', voices);

  selectedVoice =
    voices.find(v => v.lang === 'fr-FR') ||
    voices.find(v => v.lang.startsWith('fr')) ||
    voices[0] ||
    null;
}

if ('speechSynthesis' in window) {
  loadVoices();

  // Safari charge les voix plus tard
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

// ------------------------------
// Débloquer audio iPhone
// ------------------------------
function unlockAudio() {
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  window.speechSynthesis.speak(u);
}

// IMPORTANT : interaction utilisateur
window.addEventListener(
  'touchstart',
  () => {
    unlockAudio();
  },
  { once: true }
);

window.addEventListener(
  'click',
  () => {
    unlockAudio();
  },
  { once: true }
);

// ------------------------------
// TTS
// ------------------------------
function speak(text: string) {
  if (!text) return;

  // Arrêter le micro avant de parler
  if (stopListening) {
    stopListening();
  }

  // Nettoyage texte
  text = text.replace(/[\\u200B-\\u200D\\uFEFF]/g, '').trim();

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.onstart = () => {
    console.log('🗣️ JARVIS parle');
    gaussianAvatar.setChatState('Speaking');
  };

  utterance.onend = () => {
    console.log('🎧 Fin parole');
    gaussianAvatar.setChatState('Listening');

    // Relancer le micro après la parole
    if (startListeningAgain) {
      setTimeout(() => startListeningAgain && startListeningAgain(), 300);
    }
  };

  utterance.onerror = e => {
    console.error('Erreur TTS iOS:', e);

    if (startListeningAgain) {
      setTimeout(() => startListeningAgain && startListeningAgain(), 300);
    }
  };

  // Safari aime un petit délai
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 100);
}

// ------------------------------
// WebSocket
// ------------------------------
connectWebSocket(data => {
  console.log('📩', data);

  switch (data.type) {
    case 'blendshapes':
      gaussianAvatar.updateBlendshapes(data.data);
      break;

    case 'state':
      gaussianAvatar.setChatState(data.state);
      break;

    case 'response':
      if (data.text) {
        speak(data.text);
      }
      break;
  }
});

// ------------------------------
// Micro automatique
// ------------------------------
const speechControl = startAutoListening((text: string) => {
  console.log('🎤', text);

  sendMessage({
    type: 'user_message',
    text,
  });
});

// startAutoListening doit retourner { start, stop }
if (speechControl) {
  stopListening = speechControl.stop;
  startListeningAgain = speechControl.start;
}
