import { GaussianAvatar } from "./gaussianAvatar";
import { connectWebSocket } from "./services/websocket";


console.log("🔥🔥🔥 MAIN JARVIS COMPLETE VERSION 🔥🔥🔥");


// ===============================
// AVATAR
// ===============================

const div =
document.getElementById(
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




// ===============================
// AUDIO ACTIVATION
// (obligatoire iPhone)
// ===============================

let audioUnlocked = false;



function unlockAudio(){


if(audioUnlocked)
return;



const test =
new SpeechSynthesisUtterance(
"JARVIS activé"
);



test.lang =
"fr-FR";


test.volume =
1;


test.rate =
1;



window.speechSynthesis.cancel();


window.speechSynthesis.speak(
test
);



audioUnlocked = true;



console.log(
"✅ AUDIO ACTIVÉ"
);



}




document.addEventListener(
"click",
unlockAudio,
{
once:true
}
);







// ===============================
// TTS
// ===============================

function speak(
text:string
){



console.log(
"🗣️ JARVIS doit lire :",
text
);



if(!text)
return;



if(!audioUnlocked){


console.log(
"⚠️ Audio non activé"
);


return;

}





const speech =
new SpeechSynthesisUtterance(
text
);



speech.lang =
"fr-FR";


speech.rate =
1;


speech.pitch =
1;


speech.volume =
1;






const voices =
window.speechSynthesis.getVoices();



const french =
voices.find(
v =>
v.lang
.toLowerCase()
.includes("fr")
);



if(french){

speech.voice =
french;


console.log(
"🎙️ Voix :",
french.name
);

}






speech.onstart =
()=>{


console.log(
"🔊 JARVIS PARLE"
);



gaussianAvatar.setChatState(
"Speaking"
);



};





speech.onend =
()=>{


console.log(
"🎧 JARVIS FINI"
);



gaussianAvatar.setChatState(
"Listening"
);



};






speech.onerror =
(e)=>{


console.error(
"❌ ERREUR TTS",
e
);



};





window.speechSynthesis.cancel();



setTimeout(
()=>{


window.speechSynthesis.speak(
speech
);


},
200
);



}







// ===============================
// WEBSOCKET BACKEND RENDER
// ===============================


connectWebSocket(
(data)=>{


console.log(
"📩 MESSAGE RECU BACKEND :",
data
);




switch(data.type){



// Animation bouche

case "blendshapes":


gaussianAvatar.updateBlendshapes(
data.data
);


break;





// Etat avatar

case "state":


gaussianAvatar.setChatState(
data.state
);


break;






// Réponse IA

case "response":


console.log(
"✅ REPONSE JARVIS :",
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
