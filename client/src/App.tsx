import { useState, useEffect } from 'react'

function App() {
  const [socket, setSocket] = useState<WebSocket | undefined>(undefined);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:5263/ws')
    setSocket(newSocket);
    newSocket.addEventListener("open", () => {
      console.log('Connected');
      newSocket.send('Hello Server') ; 
    });

    newSocket.addEventListener("message", (event) => {
      console.log('Received event:', event.data);
      setMessages(oldMessages => [...oldMessages, event.data]);
    });
  }, []);



  return (
    <>
      <h1>WebSocket Chat app</h1>
      <button onClick={() => {
        if(!socket)
        {
          console.log('No socket connection');
          return;
        }
        socket.send('Hello Server');
      }}
      disabled={!socket}
      >Send</button>
      <div>
        {messages.map((message, i) => (
          <div key={i.toString()}>{message}</div>
        ))}
      </div>
    </>
  )
}

export default App
