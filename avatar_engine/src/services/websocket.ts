let socket: WebSocket | null = null;

export function connectWebSocket(onMessage: (data: any) => void) {
  socket = new WebSocket("wss://jarvis-api-08dr.onrender.com/ws");

  socket.onopen = () => {
    console.log("✅ Connecté backend JARVIS");
    socket?.send(
      JSON.stringify({
        type: "avatar",
        message: "Avatar connecté",
      })
    );
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error("Erreur JSON WebSocket:", error);
    }
  };

  socket.onerror = (err) => {
    console.error("❌ WebSocket erreur:", err);
  };

  socket.onclose = () => {
    console.log("🔌 Déconnecté du backend JARVIS");
    socket = null;
  };
}

export function sendMessage(data: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else {
    console.warn("⚠️ WebSocket non prêt");
  }
}
