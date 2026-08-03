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
// TTS navigateur amélioré
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



  const startSpeak = () => {


    const voices =
      window.speechSynthesis.getVoices();



    console.log(
      "🎙️ VOIX DISPONIBLES :",
      voices
    );



    const utterance =
      new SpeechSynthesisUtterance(
        text
      );



    utterance.lang = "fr-FR";

    utterance.rate = 1;

    utterance.pitch = 0.9;

    utterance.volume = 1;



    const frenchVoice =
      voices.find(
        voice =>
          voice.lang
          .toLowerCase()
          .includes("fr")
      );



    if (frenchVoice) {


      console.log(
        "✅ VOIX CHOISIE :",
        frenchVoice.name
      );


      utterance.voice =
        frenchVoice;


    } else {


      console.log(
        "⚠️ Aucune voix française trouvée"
      );


    }




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






    window.speechSynthesis.cancel();



    window.speechSynthesis.speak(
      utterance
    );


  };






  // Attendre le chargement des voix

  if (
    window.speechSynthesis
    .getVoices()
    .length === 0
  ) {


    console.log(
      "⏳ Chargement des voix..."
    );


    window.speechSynthesis.onvoiceschanged =
      startSpeak;



  } else {


    startSpeak();


  }



}






// ===============================
// WebSocket Avatar
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
        data
      );


      break;


  }


});
