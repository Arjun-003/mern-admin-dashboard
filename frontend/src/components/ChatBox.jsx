import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import socket from "../api/SocketIo.js";
import { AuthContext } from "../context/AuthContext.jsx";

const ChatBox = () => {

  const { user, token, loading } = useContext(AuthContext);
  const userId = user?.id;
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);

  useEffect(() => {

    if (!userId || loading || !token) return;

    const fetchChats = async () => {

      const res = await api.get(`/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setChats(res.data);

    };

    fetchChats();

  }, [userId, loading, token]);


  useEffect(() => {

    const handleNewMessage = (msg) => {

      setChats(prev =>
        prev.map(chat =>
          chat.id === msg.chatId
            ? {
                ...chat,
                lastMessage: msg,
                unreadCount: (chat.unreadCount || 0) + 1
              }
            : chat
        )
      );

    };

    socket.on("newMessage", handleNewMessage);

    return () => socket.off("newMessage", handleNewMessage);

  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="w-full max-w-sm border rounded-xl bg-white shadow-sm">

        <div className="px-4 py-3 border-b font-semibold">Chats</div>

        <div className="divide-y">
          
          {chats.map(chat => {

            const otherUser =
              chat.sender.id === userId ? chat.receiver : chat.sender;

            const productName = chat.product?.name || "Item no longer available";

            const productImage =
              chat.product?.images?.[0]?.imageUrl
                ? `http://localhost:5000/${chat.product.images[0].imageUrl}`
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

            return (

              <div
                key={chat.id}
                onClick={() =>
                  navigate(`/chat-window/${otherUser.id}/${chat.productId}`)
                }
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
              >

                <div className="relative h-10 w-10">

                  <img
                    src={productImage}
                    className="h-full w-full rounded-full object-cover"
                  />

                  <img
                    src={
                      otherUser?.profile_image
                        ? `http://localhost:5000/${otherUser.profile_image}`
                        : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    className="absolute bottom-0 right-0 h-6 w-6 rounded-full border-2 border-white object-cover"
                  />

                </div>

                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {otherUser?.name} - {productName}
                  </p>

                  <p className="text-xs text-gray-500 truncate">
                    {chat.lastMessage?.message}
                  </p>
                </div>

                {chat.unreadCount > 0 && (
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {chat.unreadCount}
                  </div>
                )}

              </div>

            );

          })}

        </div>

      </div>

    </div>
  );
};

export default ChatBox;
