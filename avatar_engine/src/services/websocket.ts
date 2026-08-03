let socket: WebSocket | null = null;


export function connectWebSocket(
  onMessage: (data: any) => void
) {

  socket = new WebSocket(
    "wss://jarvis-api-08dr.onrender.com/ws"
  );


  socket.onopen = () => {

    console.log(
      "✅ Connecté au backend JARVIS Render"
    );


    socket?.send(
      JSON.stringify({
        type: "avatar",
        message: "Avatar connecté"
      })
    );

  };



  socket.onmessage = (event) => {

    try {


      const data = JSON.parse(
        event.data
      );


      console.log(
        "📩 Message reçu :",
        data
      );



      // ===============================
      // TEST TTS NAVIGATEUR
      // ===============================

      if (
        data.type === "response" &&
        data.text
      ) {


        console.log(
          "🔊 TEST VOIX :",
          data.text
        );


        const speech =
          new SpeechSynthesisUtterance(
            data.text
          );


        speech.lang = "fr-FR";

        speech.rate = 1;

        speech.pitch = 0.9;

        speech.volume = 1;



        speech.onstart = () => {

          console.log(
            "🗣️ JARVIS parle"
          );

        };



        speech.onend = () => {

          console.log(
            "🎧 JARVIS terminé"
          );

        };



        speech.onerror = (error) => {

          console.log(
            "❌ Erreur TTS :",
            error
          );

        };



        window.speechSynthesis.cancel();


        window.speechSynthesis.speak(
          speech
        );


      }



      // Envoie aussi le message au main.ts

      onMessage(data);



    } catch (error) {


      console.error(
        "Erreur message WebSocket :",
        error
      );


    }

  };




  socket.onerror = (error) => {

    console.error(
      "❌ Erreur WebSocket :",
      error
    );

  };




  socket.onclose = () => {

    console.log(
      "❌ Déconnecté du backend"
    );


    socket = null;

  };


}




export function sendMessage(
  data: any
) {


  if (
    socket &&
    socket.readyState === WebSocket.OPEN
  ) {


    socket.send(
      JSON.stringify(data)
    );


  } else {


    console.warn(
      "WebSocket non connecté"
    );


  }

}
