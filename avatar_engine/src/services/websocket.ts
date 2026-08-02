let socket: WebSocket | null = null;

export function connectWebSocket(onMessage: (data: any) => void) {
  socket = new WebSocket("ws://localhost:8000/ws");

  socket.onopen = () => {
    console.log("✅ Connecté au backend");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  socket.onclose = () => {
    console.log("❌ Déconnecté");
  };
}

export function sendMessage(data: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}
