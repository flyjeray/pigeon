import { useState } from "react";
import { useSupabase } from "../supabase/hooks";

export const useAuthActions = () => {
  const [status, setStatus] = useState<string>("");
  const { wrapper } = useSupabase();

  const signUp = async (email: string, password: string) => {
    if (!wrapper) {
      setStatus("Supabase not initialized");
      return { data: null, error: new Error("Supabase not initialized") };
    }

    const { data, error } = await wrapper.auth.signUp(email, password);
    if (error) {
      setStatus(`Sign Up Error: ${error.message}`);
    } else {
      setStatus(`Sign Up Success: ${data.user?.email}`);
    }
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    if (!wrapper) {
      setStatus("Supabase not initialized");
      return { data: null, error: new Error("Supabase not initialized") };
    }

    const { data, error } = await wrapper.auth.signIn(email, password);
    if (error) {
      setStatus(`Sign In Error: ${error.message}`);
    } else {
      setStatus(`Sign In Success: ${data.user?.email}`);
    }
    return { data, error };
  };

  const signOut = async () => {
    if (!wrapper) {
      setStatus("Supabase not initialized");
      return { error: new Error("Supabase not initialized") };
    }

    const { error } = await wrapper.auth.signOut();
    if (error) {
      setStatus(`Sign Out Error: ${error.message}`);
    } else {
      setStatus("Signed out successfully");
    }
    return { error };
  };

  return {
    signUp,
    signIn,
    signOut,
    status,
    setStatus,
  };
};
