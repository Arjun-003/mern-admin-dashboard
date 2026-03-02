import { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // ✅ Restore auth from localStorage
  useEffect(() => {

    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {

        const parsedUser = JSON.parse(storedUser);

        if (typeof parsedUser === "object") {
          setUser(parsedUser);
          setToken(storedToken);
        } else {
          throw new Error("Invalid user format");
        }

      } catch (err) {

        console.error("Auth restore error:", err);

        // remove corrupted data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setLoading(false);

  }, []);

  // ✅ LOGIN FUNCTION (ADD THIS BACK)
  const login = useCallback((userData, tokenData) => {

    setUser(userData);
    setToken(tokenData);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);

    console.log("User logged in");

  }, []);

  // ✅ Logout function
  const logout = useCallback(() => {

    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");

  }, []);

  // ✅ Update user profile
  const updateUser = useCallback((updatedUser) => {

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,   // ✅ now exists
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
