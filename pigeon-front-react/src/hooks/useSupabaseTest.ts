import { useState } from "react";
import { useSupabase } from "../supabase/hooks";

export const useSupabaseTest = () => {
  const [status, setStatus] = useState<string>("");
  const { wrapper, initialized } = useSupabase();

  const testSupabaseWrapper = () => {
    if (!wrapper) {
      setStatus("Supabase not initialized");
      return;
    }
    setStatus("SupabaseWrapper accessed successfully!");
    console.log("Supabase client:", wrapper.getClient());
  };

  return {
    testSupabaseWrapper,
    status,
    initialized,
  };
};
