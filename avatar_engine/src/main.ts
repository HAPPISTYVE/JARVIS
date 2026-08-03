import { GaussianAvatar } from "./gaussianAvatar";
import { connectWebSocket } from "./services/websocket";


const div = document.getElementById("LAM_WebRender") as HTMLDivElement;

const assetPath = "./asset/arkit/p2-1.zip";


const gaussianAvatar = new GaussianAvatar(
  div,
  assetPath
);


gaussianAvatar.start();


// ===============================
// Voix navigateur
// ===============================

function speak(text: string) {

  if (!text) {
    console.log("Texte vide");
    return;
  }


  console.log("🗣️ Texte à prononcer :", text);


  const speech = new SpeechSynthesisUtterance(text);


  speech.lang = "fr-FR";
  speech.rate = 1;
  speech.pitch = 0.8;
  speech.volume = 1;



  const voices = window.speechSynthesis.getVoices();


  const frenchVoice = voices.find((voice) =>
    voice.lang.toLowerCase().startsWith("fr")
  );


  if (frenchVoice) {
    speech.voice = frenchVoice;
  }



  speech.onstart = () => {

    console.log("🔊 JARVIS parle");

    gaussianAvatar.setChatState(
      "Responding"
    );

  };



  speech.onend = () => {

    console.log("🎧 JARVIS écoute");

    gaussianAvatar.setChatState(
      "Listening"
    );

  };



  speech.onerror = (error) => {

    console.log(
      "Erreur voix :",
      error
    );

  };



  window.speechSynthesis.cancel();

  window.speechSynthesis.speak(
    speech
  );

}



// ===============================
// WebSocket Backend
// ===============================

connectWebSocket((data) => {


  console.log(
    "📩 Message reçu :",
    data
  );



  switch (data.type) {



    case "blendshapes":

      gaussianAvatar.updateBlendshapes(
        data.data
      );

      break;



    case "state":

      gaussianAvatar.setChatState(
        data.state
      );

      break;



    case "response":

      console.log(
        "✅ Réponse JARVIS reçue"
      );

      speak(
        data.text
      );

      break;



    default:

      console.log(
        "⚠️ Type inconnu :",
        data.type
      );

      break;

  }

});
