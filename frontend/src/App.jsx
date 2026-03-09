import { useState } from "react";
import{v4 as uuidv4}from"uuid"
import { sendMessage } from "./api";
import Header from "./components/Header";
import ChatBox from "./components/ChatBox";
import InputBar from "./components/InputBar";
import Disclaimer from "./components/Disclaimer";

function App() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Bonjour HAPPI STYVE ! je suis JARVIS, ton assistant. Dis moi ce que tu veux faire aujourd'hui."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(uuidv4());

  const handleSend = async () => {
    console.log("CLICK OK");
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const data = await sendMessage(sessionId, input);
      const aiMessage = { role: "ai", text: data.response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      alert("Server error");
    }

    setLoading(false);
    setInput("");
  };

  return (
    <div className="app">
      <Header />
      <ChatBox messages={messages} loading={loading} />
      <InputBar input={input} setInput={setInput} onSend={handleSend} />
      <Disclaimer />
    </div>
  );
}

export default App;
