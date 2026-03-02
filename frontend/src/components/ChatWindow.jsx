import { useState, useRef, useEffect, useContext } from "react";
import api from "../api/axios.js";
import { useParams } from "react-router-dom";
import socket from "../api/SocketIo.js";
import { AuthContext } from "../context/AuthContext.jsx";

const ChatWindow = () => {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [product, setProduct] = useState(null);

  const { user } = useContext(AuthContext);

  const senderId = user?.id;
  const { receiverId, productId } = useParams();

  const messagesEndRef = useRef(null);

  useEffect(() => {

    if (!senderId) return;

    socket.connect();
    socket.emit("join", senderId);

  }, [senderId]);


  useEffect(() => {

    if (!senderId) return;

    socket.emit("getMessages", {
      receiverId,
      productId
    });

  }, [senderId, receiverId, productId]);


  useEffect(() => {

    const handleMessages = (data) => {

      const formatted = data.map(m => ({
        id: m.id,
        text: m.message,
        senderId: m.senderId,
        chatId: m.chatId
      }));

      setMessages(formatted);

    };

    socket.on("messagesData", handleMessages);

    return () => socket.off("messagesData", handleMessages);

  }, []);


  useEffect(() => {

    const handleNewMessage = (msg) => {

      setMessages(prev => {

        const exists = prev.find(m => m.id === msg.id);
        if (exists) return prev;

        return [
          ...prev,
          {
            id: msg.id,
            text: msg.message,
            senderId: msg.senderId,
            chatId: msg.chatId
          }
        ];

      });

    };

    socket.on("newMessage", handleNewMessage);

    return () => socket.off("newMessage", handleNewMessage);

  }, []);


  useEffect(() => {

    const handleSent = (msg) => {

      setMessages(prev => [
        ...prev,
        {
          id: msg.id,
          text: msg.message,
          senderId: msg.senderId,
          chatId: msg.chatId
        }
      ]);

    };

    socket.on("messageSent", handleSent);

    return () => socket.off("messageSent", handleSent);

  }, []);


  useEffect(() => {

    if (!messages.length) return;

    socket.emit("markAsRead", {
      chatId: messages[0].chatId
    });

  }, [messages]);


  // ⭐ SAFE PRODUCT FETCH
  useEffect(() => {

    if (!productId) return;

    const fetchProduct = async () => {

      try {
        const res = await api.get(`/singleProduct/${productId}`);
        console.log(res.data,'response');
        setProduct(res.data);
      } catch (err) {
        // product deleted
        setProduct(null);
      }

    };

    fetchProduct();

  }, [productId]);


  const sendMessage = () => {

    if (!input.trim()) return;

    socket.emit("sendMessage", {
      receiverId,
      productId,
      message: input
    });

    setInput("");

  };


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  return (

    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg flex flex-col h-[420px]">

      <div className="px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">Chat</h2>

        {product ? (
          <div className="mt-2 flex items-center gap-3">

            <img
              src={
                product?.images?.length
                  ? `http://localhost:5000/${product.images[0].imageUrl}`
                  : "https://via.placeholder.com/40"
              }
              className="h-10 w-10 rounded-md object-cover"
            />

            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-gray-500">₹ {product.price}</p>
            </div>

          </div>
        ) : (
          <div className="mt-2 text-sm text-red-500">
            Item is sold or no longer available
          </div>
        )}

      </div>


      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">

        {messages.map(msg => {

          const isMe = msg.senderId === senderId;

          return (

            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >

              <div
                className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                  isMe
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text}
              </div>

            </div>

          );

        })}

        <div ref={messagesEndRef} />

      </div>


      <div className="p-3 border-t flex gap-2">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 px-3 py-2 border rounded-md"
          placeholder="Type a message..."
        />

        <button
          onClick={sendMessage}
          className="bg-yellow-500 text-white px-4 py-2 rounded-md"
        >
          Send
        </button>

      </div>

    </div>
  );
};

export default ChatWindow;
