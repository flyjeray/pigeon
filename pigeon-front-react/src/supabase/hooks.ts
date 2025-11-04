import { useContext } from "react";
import { SupabaseContext, type SupabaseContextType } from "./context";
import type { User } from "@supabase/supabase-js";

export const useSupabase = (): SupabaseContextType => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within SupabaseProvider");
  }
  return context;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

export const useAuth = (): AuthContextType => {
  const { user, loading } = useSupabase();

  return {
    user,
    loading,
  };
};
