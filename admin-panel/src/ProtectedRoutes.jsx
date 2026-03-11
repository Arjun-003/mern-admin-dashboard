import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthProvider";

const ProtectedRoute = () => {
  const { token, loading } = useContext(AuthContext);

  // wait until auth state is restored from localStorage
  if (loading) {
    return null; // or a loader/spinner
  }

  // if no token → redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // if token exists → allow access
  return <Outlet />;
};

export default ProtectedRoute;