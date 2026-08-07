import { GaussianAvatar } from './gaussianAvatar';
import { connectWebSocket, sendMessage } from './services/websocket';
import { startAutoListening } from './services/speech';

console.log('🔥 JARVIS iOS FIX VERSION');

const div = document.getElementById('LAM_WebRender') as HTMLDivElement;
const assetPath = './asset/arkit/p2-1.zip';

const gaussianAvatar = new GaussianAvatar(div, assetPath);
gaussianAvatar.start();

let selectedVoice: SpeechSynthesisVoice | null = null;
let audioReady = false;
let stopListening: (() => void) | null = null;
let startListeningAgain: (() => void) | null = null;

// ------------------------------
// Charger et trier les voix pour un meilleur accent
// ------------------------------
function loadVoices() {
  const voices = window.speechSynthesis.getVoices();
  console.log('Voices disponibles:', voices);

  // Recherche d'une voix française de haute qualité (Apple Enhanced/Premium ou Google)
  selectedVoice =
    voices.find(v => v.lang === 'fr-FR' && (v.name.includes('Enhanced') || v.name.includes('Premium') || v.name.includes('Google'))) ||
    voices.find(v => v.lang === 'fr-FR') ||
    voices.find(v => v.lang.startsWith('fr')) ||
    voices[0] ||
    null;

  if (selectedVoice) {
    console.log(`✅ Voix sélectionnée : ${selectedVoice.name} (${selectedVoice.lang})`);
  }
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
const activateButton = document.createElement('button');

activateButton.innerText = '🎙️ Activer JARVIS';

activateButton.style.position = 'fixed';
activateButton.style.top = '20px';
activateButton.style.left = '20px';
activateButton.style.zIndex = '99999';
activateButton.style.padding = '15px';
activateButton.style.fontSize = '18px';

activateButton.onclick = () => {
  const test = new SpeechSynthesisUtterance(
    'Bonjour, JARVIS est activé'
  );

  test.lang = 'fr-FR';
  test.volume = 1;
  test.rate = 1;
  test.pitch = 1;

  if (selectedVoice) {
    test.voice = selectedVoice;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(test);

  audioReady = true;
  activateButton.remove();

  console.log('✅ Audio activé');
};

document.body.appendChild(activateButton);

// ------------------------------
// TTS
// ------------------------------
function speak(text: string) {
  if (!text) return;
  if (!audioReady) {
    console.log("⚠️ Audio non activé");
    return;
  }
  // Arrêter le micro avant de parler
  if (stopListening) {
    stopListening();
  }

  // Nettoyage texte
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  utterance.rate = 1;   // Vitesse normale (ajustez entre 0.9 et 1.1 si besoin)
  utterance.pitch = 1;  // Ton normal
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
