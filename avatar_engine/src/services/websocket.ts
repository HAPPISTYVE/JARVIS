let socket: WebSocket | null = null;

export function connectWebSocket(onMessage: (data: any) => void) {

  socket = new WebSocket(
    "wss://jarvis-api-08dr.onrender.com/ws"
  );

  socket.onopen = () => {
    console.log("✅ Connecté au backend JARVIS Render");

    // Test de connexion
    socket?.send(JSON.stringify({
      type: "avatar",
      message: "Avatar connecté"
    }));
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      console.log("📩 Message reçu :", data);

      onMessage(data);

    } catch (error) {
      console.error("Erreur message WebSocket :", error);
    }
  };


  socket.onerror = (error) => {
    console.error("❌ Erreur WebSocket :", error);
  };


  socket.onclose = () => {
    console.log("❌ Déconnecté du backend");

    socket = null;
  };
}


export function sendMessage(data: any) {

  if (socket && socket.readyState === WebSocket.OPEN) {

    socket.send(JSON.stringify(data));

  } else {

    console.warn("WebSocket non connecté");

  }
}
