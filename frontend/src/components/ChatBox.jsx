import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import socket from "../api/SocketIo.js";
import { useAuth } from "../context/AuthProvider.jsx";

const ChatBox = () => {

  const { user, token, loading } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);

  useEffect(() => {

    if (!userId || loading || !token) return;

    const handleChats = (data) => {
    
      setChats(data);
    };

    socket.on("takeChats", handleChats);

    socket.emit("getUserChats");

    return () => {
      socket.off("takeChats", handleChats);
    };

  }, [userId, loading, token]);


  useEffect(() => {

    const handleNewMessage = (msg) => {

      setChats(prev => {

        const existingChat = prev.find(
          chat => chat.id === msg.chatId
        );

        // chat already exists
        if (existingChat) {

          return prev.map(chat =>
            chat.id === msg.chatId
              ? {
                ...chat,
                lastMessage: msg,
                unreadCount: (chat.unreadCount || 0) + 1
              }
              : chat
          );

        }

        // new chat created first time
        socket.emit("getUserChats");

        return prev;

      });

    };

    socket.on("newMessage", handleNewMessage);

    return () => socket.off("newMessage", handleNewMessage);

  }, []);

  const deleteChat = async (chatId) => {
    try {
      api.delete("/chatDelete", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setChats(prev =>
        prev.filter(chat => chat.id !== chatId)
      );
    } catch (error) {
      console.log(error);

    }

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="w-full max-w-sm border rounded-xl bg-white shadow-sm">

        <div className="px-4 py-3 border-b font-semibold">Chats</div>

        <div className="divide-y">

          {chats.length >= 1 ?

            chats.map(chat => {

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
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition"
                >

                  {/* Images */}
                  <div className="relative h-10 w-10 flex-shrink-0">

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

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">

                    <p className="font-medium text-sm truncate">
                      {otherUser?.name} - {productName}
                    </p>

                    <p className="text-xs text-gray-500 truncate">
                      {chat.lastMessage?.message}
                    </p>

                  </div>

                  {/* Right Side */}
                  <div className="flex items-center gap-2">

                    {chat.unreadCount > 0 && (
                      <div className="bg-red-500 text-white text-xs min-w-[22px] h-[22px] flex items-center justify-center rounded-full px-1">
                        {chat.unreadCount}
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-md hover:bg-red-200 transition"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              );

            }) : (
              <h3 className="p-6 font-medium text-sm ">No Chats Found</h3>
            )}

        </div>

      </div>

    </div>
  );
};

export default ChatBox;
