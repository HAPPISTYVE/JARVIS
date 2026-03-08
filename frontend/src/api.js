import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const sendMessage = async (sessionID, message) => {
  const response = await API.post("/chat", {
    session_id: sessionID,
    message: message,
    ctx:{}
  });
  return response.data;
};

