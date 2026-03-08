import { useEffect, useRef } from "react";
import Message from "./Message";
import Loader from "./Loader";

function ChatBox({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="chat-box">
      {messages.map((msg, index) => (
        <Message key={index} role={msg.role} text={msg.text} />
      ))}
      {loading && <Loader />}
      <div ref={bottomRef}></div>
    </div>
  );
}

export default ChatBox;

