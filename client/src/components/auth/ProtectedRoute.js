import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loading } from "../ui/Feedback";

/** Renders children only for signed-in users with one of the allowed roles. */
export default function ProtectedRoute({ roles, children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <Loading label="Checking your session..." />;
  if (!user) return <Navigate to="/" replace state={{ from: location.pathname, needsLogin: true }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
