import { Send } from "lucide-react";

function InputBar({ input, setInput, onSend }) {
  return (
    <div className="input-bar">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Describe your symptoms..."
      />
      <button className="send-btn" onClick={onSend}>
        <Send size={18} />
      </button>
    </div>
  );
}

export default InputBar;

