import { GaussianAvatar } from "./gaussianAvatar";
import { connectWebSocket } from "./services/websocket";


console.log("🔥🔥🔥 MAIN TTS SYSTEM VERSION 🔥🔥🔥");



const div = document.getElementById(
  "LAM_WebRender"
) as HTMLDivElement;



const assetPath =
  "./asset/arkit/p2-1.zip";



const gaussianAvatar =
  new GaussianAvatar(
    div,
    assetPath
  );



gaussianAvatar.start();





// =====================================
// TTS NAVIGATEUR
// =====================================


function speak(text: string) {


  console.log(
    "🚀 SPEAK APPELÉ :",
    text
  );


  if(!text){

    console.log(
      "❌ Texte vide"
    );

    return;

  }



  if(!window.speechSynthesis){

    console.log(
      "❌ TTS non disponible"
    );

    return;

  }



  const utterance =
    new SpeechSynthesisUtterance(
      text
    );



  utterance.lang = "fr-FR";

  utterance.rate = 1;

  utterance.pitch = 1;

  utterance.volume = 1;



  // On laisse le navigateur choisir la voix

  console.log(
    "🎙️ Voix automatique navigateur"
  );





  utterance.onstart = () => {


    console.log(
      "🔊 JARVIS PARLE"
    );


    gaussianAvatar.setChatState(
      "Speaking"
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





  // Réveille le moteur vocal

  window.speechSynthesis.resume();



  // Nettoyage ancienne lecture

  window.speechSynthesis.cancel();




  setTimeout(()=>{


    window.speechSynthesis.speak(
      utterance
    );


  },500);



}







// =====================================
// WEBSOCKET AVATAR
// =====================================


connectWebSocket(
(data)=>{


console.log(
"📩 MESSAGE AVATAR :",
data
);




switch(data.type){



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
"✅ TEXTE JARVIS REÇU :",
data.text
);



speak(
data.text
);


break;





default:


console.log(
"⚠️ MESSAGE INCONNU :",
data
);


break;



}



});
