import { GaussianAvatar } from "./gaussianAvatar";
import { connectWebSocket } from "./services/websocket";


console.log("🔥🔥🔥 MAIN TTS VERSION ACTIVE 🔥🔥🔥");


const div = document.getElementById(
  "LAM_WebRender"
) as HTMLDivElement;


const assetPath =
  "./asset/arkit/p2-1.zip";



const gaussianAvatar = new GaussianAvatar(
  div,
  assetPath
);



gaussianAvatar.start();



// ===============================
// TTS navigateur
// ===============================

function speak(text: string) {


  console.log(
    "🚀 SPEAK APPELÉ AVEC :",
    text
  );


  if (!text) {

    console.log(
      "❌ Texte vide"
    );

    return;
  }



  const utterance =
    new SpeechSynthesisUtterance(
      text
    );



  utterance.lang = "fr-FR";

  utterance.rate = 1;

  utterance.pitch = 0.9;

  utterance.volume = 1;



  utterance.onstart = () => {


    console.log(
      "🔊 JARVIS PARLE"
    );


    gaussianAvatar.setChatState(
      "Responding"
    );


  };




  utterance.onend = () => {


    console.log(
      "🎧 JARVIS FINI"
    );


    gaussianAvatar.setChatState(
      "Listening"
    );


  };




  utterance.onerror = (error) => {


    console.error(
      "❌ ERREUR TTS :",
      error
    );


  };




  // Stop ancienne voix

  window.speechSynthesis.cancel();



  // Lance la voix

  window.speechSynthesis.speak(
    utterance
  );


}






// ===============================
// WebSocket
// ===============================


connectWebSocket((data) => {


  console.log(
    "📩 MESSAGE AVATAR :",
    data
  );



  switch(data.type) {



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
        "✅ TEXTE JARVIS RECU :",
        data.text
      );


      speak(
        data.text
      );


      break;





    default:


      console.log(
        "⚠️ TYPE INCONNU :",
        data.type
      );


      break;


  }


});
