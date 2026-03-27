import { Navigate, Outlet } from "react-router-dom";
import LoadingScreen from "../components/shared/LoadingScreen";
import { useAuth } from "../context/AuthContext";

export default function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen label="Checking session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
