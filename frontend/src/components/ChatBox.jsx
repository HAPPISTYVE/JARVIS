import { useEffect, useRef } from "react";
import Message from "./Message";
import Loader from "./Loader";

function ChatBox({ messages, loading }) {
   const bottomRef = useRef(null);
   useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return(
        <div className="chat-box">
      {messages.length === 1 && (
        <div className="welcome-center">
          <h2>How can I help you today?</h2>
          <div className="suggestions">
            <button>Headaches and fever</button>
            <button>Chest pain</button>
            <button>Abdominal pain</button>
            <button>Skin rash</button>
            </div>
            </div>
      )}
      
    
 
      {messages.map((msg, index) => (
        <Message key={index} role={msg.role} text={msg.text} />
      ))}
      {loading && <Loader />}
      <div ref={bottomRef}></div>
    </div>
  );
}

export default ChatBox;

