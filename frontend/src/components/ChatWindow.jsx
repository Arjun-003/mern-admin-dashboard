import { useState, useRef, useEffect } from "react";
import api from "../api/axios.js";
import { useParams } from "react-router-dom";
import socket from "../api/SocketIo.js";
import { useAuth } from "../context/AuthProvider.jsx";

const ChatWindow = () => {
  const { receiverId, productId } = useParams();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [product, setProduct] = useState(null);

  const { user, token } = useAuth();

  const senderId = user?.id;

  const messagesEndRef = useRef(null);

  useEffect(() => {

    const oldMessages = async () => {
      try {
        const messagesData = await api.get(
          `/getOldMessages/${receiverId}/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setMessages(messagesData.data);

      } catch (error) {
        console.error(error);
      }
    };

    oldMessages();

  }, [receiverId, productId, token]);


  // REALTIME NEW MESSAGE
  useEffect(() => {
    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        const exists = prev.find((m) => m.id === msg.id);

        if (exists) return prev;

        return [
          ...prev,
          {
            id: msg.id,
            message: msg.message,
            senderId: msg.senderId,
            chatId: msg.chatId,
          },
        ];
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, []);

  // SEND MESSAGE
  const sendMessage = () => {
    if (!input.trim()) return;

    socket.emit("sendMessage", {
      receiverId,
      productId,
      message: input,
    });

    setInput("");
  };

  // MARK AS READ
 useEffect(() => {
  if (!messages.length) return;

  socket.emit("markAsRead", {
    chatId: messages[0].chatId,
  });

}, [messages]);

  // FETCH PRODUCT
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const res = await api.get(`/singleProduct/${productId}`);

        setProduct(res.data);
      } catch (err) {
        setProduct(null);
      }
    };

    fetchProduct();
  }, [productId]);

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
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
              <p className="text-sm text-gray-500">
                ₹ {product.price}
              </p>
            </div>

          </div>
        ) : (
          <div className="mt-2 text-sm text-red-500">
            Item is sold or no longer available
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">

        {messages.map((msg) => {
          const isMe = msg.senderId === senderId;

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${isMe
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 text-gray-800"
                  }`}
              >
                {msg.message}
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
          onKeyDown={(e) =>
            e.key === "Enter" && sendMessage()
          }
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

