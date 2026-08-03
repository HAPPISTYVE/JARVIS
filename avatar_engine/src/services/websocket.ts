let socket:WebSocket|null=null;



export function connectWebSocket(
onMessage:(data:any)=>void
){


socket =
new WebSocket(
"wss://jarvis-api-08dr.onrender.com/ws"
);



socket.onopen =
()=>{


console.log(
"✅ Connecté backend JARVIS"
);



socket?.send(
JSON.stringify({

type:"avatar",

message:"Avatar connecté"

})
);


};




socket.onmessage =
(event)=>{


const data =
JSON.parse(
event.data
);



onMessage(data);


};





socket.onerror =
(err)=>{

console.error(
"WebSocket erreur",
err
);

};





socket.onclose =
()=>{


console.log(
"Déconnecté"
);


socket=null;


};



}





export function sendMessage(data:any){


if(
socket &&
socket.readyState===WebSocket.OPEN
){


socket.send(
JSON.stringify(data)
);


}
else{


console.log(
"Socket non prêt"
);


}


}
