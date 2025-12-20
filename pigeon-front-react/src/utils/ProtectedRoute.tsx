import { Navigate } from "react-router";
import { useSupabase } from "../supabase/hooks";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useSupabase();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};
