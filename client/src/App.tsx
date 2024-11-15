import { useState, useEffect } from 'react';

function App() {
  const [socket, setSocket] = useState<WebSocket | undefined>(undefined);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:5263/ws');
    setSocket(newSocket);

    newSocket.addEventListener("open", () => {
      console.log('Connected');
    });

    newSocket.addEventListener("message", (event) => {
      setMessages((oldMessages) => [...oldMessages, event.data]);
    });

    newSocket.addEventListener("close", () => {
      console.log('Disconnected');
    });

    // Cleanup on component unmount
    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = () => {
    if (socket && inputMessage.trim() !== "") {
      socket.send(inputMessage);
      setInputMessage(""); // Clear input field
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>WebSocket Chat App</h1>
      <div>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ padding: "10px", width: "80%", marginRight: "10px" }}
        />
        <button onClick={sendMessage} disabled={!socket || socket.readyState !== WebSocket.OPEN}>
          Send
        </button>
      </div>
      <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px", maxHeight: "300px", overflowY: "scroll" }}>
        {messages.map((message, i) => (
          <div key={i.toString()}>{message}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
