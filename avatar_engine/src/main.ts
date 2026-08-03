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
// TTS navigateur
// ===============================

function speak(text: string) {

  if (!text) {
    console.log("❌ Aucun texte reçu");
    return;
  }


  console.log("🗣️ Texte à lire :", text);


  const utterance = new SpeechSynthesisUtterance(text);


  utterance.lang = "fr-FR";
  utterance.rate = 1;
  utterance.pitch = 0.9;
  utterance.volume = 1;



  utterance.onstart = () => {

    console.log("🔊 JARVIS parle");

    gaussianAvatar.setChatState(
      "Responding"
    );

  };



  utterance.onend = () => {

    console.log("🎧 JARVIS écoute");

    gaussianAvatar.setChatState(
      "Listening"
    );

  };



  utterance.onerror = (error) => {

    console.log(
      "Erreur voix :",
      error
    );

  };



  // Arrête une ancienne voix
  window.speechSynthesis.cancel();


  // Lance la voix
  window.speechSynthesis.speak(
    utterance
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
        "✅ Réponse texte reçue"
      );


      speak(
        data.text
      );


      break;



    default:

      console.log(
        "⚠️ Message non géré :",
        data
      );

  }


});
