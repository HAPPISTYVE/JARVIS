import { GaussianAvatar } from "./gaussianAvatar";
import { connectWebSocket, sendMessage } from "./services/websocket";
import { startAutoListening } from "./services/speech";


console.log(
"🔥 JARVIS AUTO VOICE VERSION"
);



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
// TTS
// ===============================


function speak(text:string){


console.log(
"🔊 Lecture :",
text
);



if(!text)
return;



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




speech.onstart =
()=>{


console.log(
"🗣️ JARVIS parle"
);


gaussianAvatar.setChatState(
"Speaking"
);


};




speech.onend =
()=>{


console.log(
"🎧 Retour écoute"
);



gaussianAvatar.setChatState(
"Listening"
);



};




window.speechSynthesis.cancel();


window.speechSynthesis.speak(
speech
);



}





// ===============================
// WEBSOCKET
// ===============================


connectWebSocket(
(data)=>{


console.log(
"📩",
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


speak(
data.text
);


break;


}



});







// ===============================
// MICRO AUTOMATIQUE
// ===============================


startAutoListening(
(text)=>{


console.log(
"🚀 Envoi automatique :",
text
);



sendMessage({

type:
"user_message",

text:
text

});


}
);
