import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { io } from "socket.io-client";

export const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000"; // Adjust as needed
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [socket, setSocket] = useState(null); // ⚡ socket state

  // Load saved login on page refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setToken(storedToken);

      // ⚡ Connect socket on refresh
      const newSocket = io(BASE_URL);
      newSocket.emit("join", parsedUser.id);
      setSocket(newSocket);
      console.log(newSocket,'new socket');
      

      // Listen for force logout
      newSocket.on("forceLogout", ({ message }) => {
        console.log("Forced logout:", message);
        logout(); // call logout
        alert(message); // optional message
      });
    }

    setLoading(false);
  }, []);

  // Login function
  const login = useCallback((userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);

    // ⚡ Connect socket on login
    const newSocket = io(BASE_URL);
    newSocket.emit("join", userData.id);
    setSocket(newSocket);

    newSocket.on("forceLogout", ({ message }) => {
      console.log("Forced logout:", message);
      logout();
      alert(message);
    });

    console.log("User logged in");
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // ⚡ Disconnect socket on logout
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [socket]);

  // Update user profile
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, socket, loading, updateUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};