import { useEffect, useRef } from "react";
import Message from "./Message";
import TypingDots from "./TypingDots";

function ChatBox({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="chat-box">

      {messages.length === 1 && (
        <div className="welcome-center">
          <h2>Que puis-je faire pour vous aujourd'hui?</h2>
          <div className="suggestions">
            <button>Donne du peps à ma journée</button>
            <button>Coder & Pirater</button>
            <button>Rechercher</button>
            <button>Apprendre</button>
          </div>
        </div>
      )}

      {messages.map((msg, index) => (
        <Message key={index} role={msg.role} text={msg.text} />
      ))}

      {/* 👉 TES 3 POINTS */}
      {loading && <TypingDots />}

      <div ref={bottomRef}></div>
    </div>
  );
}

export default ChatBox;
