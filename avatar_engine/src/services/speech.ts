let recognition: any = null;
let isPaused = false;
let shouldBeListening = false;

export function startAutoListening(onText: (text: string) => void) {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.error("❌ Speech Recognition non supporté par ce navigateur");
    return;
  }

  if (recognition) {
    try { recognition.stop(); } catch (e) {}
  }

  recognition = new SpeechRecognition();
  recognition.lang = "fr-FR";
  recognition.continuous = true;
  recognition.interimResults = false;
  shouldBeListening = true;
  isPaused = false;

  recognition.onstart = () => {
    console.log("🎤 JARVIS écoute...");
  };

  recognition.onresult = (event: any) => {
    if (isPaused) return;

    const result = event.results[event.results.length - 1];
    const text = result[0].transcript.trim();

    if (text) {
      console.log("📝 VOIX → TEXTE :", text);
      onText(text);
    }
  };

  recognition.onerror = (error: any) => {
    if (error.error !== 'aborted') {
      console.error("❌ Micro erreur :", error);
    }
  };

  recognition.onend = () => {
    if (shouldBeListening && !isPaused) {
      console.log("🔄 Redémarrage écoute...");
      setTimeout(() => {
        if (shouldBeListening && !isPaused) {
          try {
            recognition.start();
          } catch (e) {}
        }
      }, 300);
    } else {
      console.log("🛑 Micro mis en pause temporairement");
    }
  };

  try {
    recognition.start();
  } catch (e) {
    console.error("Erreur au démarrage du micro :", e);
  }
}

/**
 * Mettre en pause le micro quand JARVIS parle
 */
export function stopAutoListening() {
  isPaused = true;
  if (recognition) {
    try {
      recognition.stop();
    } catch (e) {}
  }
}

/**
 * Réactiver le micro quand JARVIS a fini de parler
 */
export function resumeAutoListening() {
  isPaused = false;
  if (recognition && shouldBeListening) {
    try {
      recognition.start();
    } catch (e) {}
  }
}
