import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function ProtectedRoute({ children }) {
  const { user, checking } = useAuth();

  if (checking) return <p className="status">Checking your session…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}