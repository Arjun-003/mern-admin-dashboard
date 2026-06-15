import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";

import socket from "../api/SocketIo.js";

export const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [socketReady, setSocketReady] = useState(false);

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // LOGOUT
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    socket.disconnect();
    socket.auth = {};
    setSocketReady(false);
  }, []);

  // FORCE LOGOUT LISTENER
  useEffect(() => {
    const handleForceLogout = ({ message }) => {
      console.log("Forced logout:", message);

      logout();

      alert(message);
    };

    socket.on("forceLogout", handleForceLogout);

    return () => {
      socket.off("forceLogout", handleForceLogout);
    };
  }, [logout]);

  // RESTORE LOGIN
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    // no login found
    if (!storedUser || !storedToken) {
      setLoading(false);
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    setUser(parsedUser);
    setToken(storedToken);

    // attach token before connect
    socket.auth = {
      token: storedToken,
    };

    // CONNECT SUCCESS
    const handleConnect = () => {
      console.log("CONNECTED:", socket.id);

      setSocketReady(true);

      // NOW app is actually ready
      setLoading(false);
    };

    // CONNECT ERROR
    const handleConnectError = (err) => {
      console.log("SOCKET ERROR:", err.message);

      setSocketReady(false);

      setLoading(false);
    };

    socket.on("connect", handleConnect);

    socket.on("connect_error", handleConnectError);

    // start connection
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);

      socket.off("connect_error", handleConnectError);
    };
  }, []);

  // LOGIN
  const login = useCallback((userData, tokenData) => {
    setUser(userData);

    setToken(tokenData);

    localStorage.setItem("user", JSON.stringify(userData));

    localStorage.setItem("token", tokenData);

    socket.auth = {
      token: tokenData,
    };

    const handleConnect = () => {
      console.log("CONNECTED:", socket.id);

      setSocketReady(true);

      setLoading(false);
    };

    const handleConnectError = (err) => {
      console.log("SOCKET ERROR:", err.message);

      setSocketReady(false);

      setLoading(false);
    };

    socket.on("connect", handleConnect);

    socket.on("connect_error", handleConnectError);

    socket.connect();
  }, []);

  // UPDATE USER
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);

    localStorage.setItem("user", JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        socket,
        loading,
        socketReady,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

