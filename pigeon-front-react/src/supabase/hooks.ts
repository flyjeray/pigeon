import { useContext } from "react";
import { SupabaseContext, type SupabaseContextType } from "./context";

export const useSupabase = (): SupabaseContextType => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within SupabaseProvider");
  }
  return context;
};
