let recognition:any = null;


export function startAutoListening(
  onText:(text:string)=>void
){


const SpeechRecognition =
(window as any).SpeechRecognition ||
(window as any).webkitSpeechRecognition;



if(!SpeechRecognition){

console.error(
"❌ Speech Recognition non supporté"
);

return;

}



recognition =
new SpeechRecognition();



recognition.lang =
"fr-FR";


recognition.continuous =
true;


recognition.interimResults =
false;



recognition.onstart = ()=>{

console.log(
"🎤 JARVIS écoute..."
);

};




recognition.onresult =
(event:any)=>{


const result =
event.results[
event.results.length - 1
];



const text =
result[0].transcript;



console.log(
"📝 VOIX → TEXTE :",
text
);



onText(text);


};





recognition.onerror =
(error:any)=>{

console.error(
"❌ Micro erreur :",
error
);


};





recognition.onend =
()=>{


console.log(
"🔄 Redémarrage écoute..."
);



setTimeout(()=>{

try{

recognition.start();

}
catch(e){}


},500);



};




recognition.start();


}
