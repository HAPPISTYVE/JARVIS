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
// ACTIVATION AUDIO (IPHONE)
// =====================================


let audioReady = false;


const activateButton =
document.createElement("button");


activateButton.innerText =
"🎙️ Activer JARVIS";


activateButton.style.position =
"fixed";


activateButton.style.top =
"20px";


activateButton.style.left =
"20px";


activateButton.style.zIndex =
"99999";


activateButton.style.padding =
"15px";


activateButton.style.fontSize =
"18px";



activateButton.onclick = () => {


  const test =
  new SpeechSynthesisUtterance(
    "Bonjour, JARVIS est activé"
  );


  test.lang =
  "fr-FR";


  test.volume =
  1;


  window.speechSynthesis.cancel();


  window.speechSynthesis.speak(
    test
  );



  audioReady = true;


  activateButton.remove();


  console.log(
    "✅ AUDIO ACTIVÉ"
  );


};



document.body.appendChild(
activateButton
);





// =====================================
// TTS
// =====================================


function speak(text:string){


console.log(
"🚀 SPEAK :",
text
);



if(!text){

return;

}



if(!window.speechSynthesis){

console.log(
"❌ TTS indisponible"
);

return;

}




if(!audioReady){

console.log(
"⚠️ Audio non activé"
);

return;

}





const utterance =
new SpeechSynthesisUtterance(
text
);



utterance.lang =
"fr-FR";


utterance.rate =
1;


utterance.pitch =
1;


utterance.volume =
1;





utterance.onstart = ()=>{


console.log(
"🔊 JARVIS PARLE"
);


gaussianAvatar.setChatState(
"Speaking"
);


};





utterance.onend = ()=>{


console.log(
"🎧 JARVIS FINI"
);


gaussianAvatar.setChatState(
"Listening"
);


};





utterance.onerror = (error)=>{


console.error(
"❌ ERREUR TTS :",
error
);


};





window.speechSynthesis.cancel();



setTimeout(()=>{


window.speechSynthesis.speak(
utterance
);



},100);



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
