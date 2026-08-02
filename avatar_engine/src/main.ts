import { GaussianAvatar } from "./gaussianAvatar";
import { connectWebSocket } from "./services/websocket";

const div = document.getElementById("LAM_WebRender") as HTMLDivElement;
const assetPath = "./asset/arkit/p2-1.zip";

const gaussianAvatar = new GaussianAvatar(div, assetPath);

gaussianAvatar.start();

// Connexion au backend
connectWebSocket((data) => {
  console.log("Message reçu :", data);

  switch (data.type) {

    case "blendshapes":
      gaussianAvatar.updateBlendshapes(data.data);
      break;

    case "state":
      gaussianAvatar.setChatState(data.state);
      break;

    default:
      console.log("Message inconnu :", data);
  }
});
