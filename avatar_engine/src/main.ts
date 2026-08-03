import { GaussianAvatar } from "./gaussianAvatar";
import { connectWebSocket } from "./services/websocket";


console.log("🔥🔥🔥 MAIN TTS FINAL VERSION 🔥🔥🔥");



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




// =====================================
// Activation TTS navigateur
// =====================================

let voices: SpeechSynthesisVoice[] = [];


function loadVoices() {

  voices = window.speechSynthesis.getVoices();

  console.log(
    "🎙️ Voix chargées :",
    voices
  );

}


loadVoices();


window.speechSynthesis.onvoiceschanged = () => {

  loadVoices();

};





// =====================================
// Fonction parler
// =====================================


function speak(text:string){


  console.log(
    "🚀 SPEAK :",
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



  // Cherche une voix française locale

  const frenchVoice =
    voices.find(
      voice =>
        voice.lang
        .toLowerCase()
        .startsWith("fr")
        &&
        !voice.name.includes("Online")
    );



  if(frenchVoice){

    console.log(
      "✅ Voix utilisée :",
      frenchVoice.name
    );


    utterance.voice =
      frenchVoice;

  }

  else{

    console.log(
      "⚠️ Pas de voix française locale"
    );

  }





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





  utterance.onerror = (error)=>{


    console.error(
      "❌ ERREUR TTS",
      error
    );


  };





  // Nettoyage ancien audio

  window.speechSynthesis.cancel();




  // délai obligatoire certains navigateurs

  setTimeout(()=>{


    window.speechSynthesis.speak(
      utterance
    );


  },300);



}






// =====================================
// Petit réveil TTS pour iPhone
// =====================================


document.addEventListener(
"click",
()=>{


  const test =
    new SpeechSynthesisUtterance(
      ""
    );


  window.speechSynthesis.speak(
    test
  );


},
{
 once:true
}
);







// =====================================
// WebSocket Avatar
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
"✅ TEXTE JARVIS :",
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


}



});
