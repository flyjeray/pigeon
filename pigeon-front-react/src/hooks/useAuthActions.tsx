import { useState } from "react";
import { useSupabase } from "../supabase/hooks";
import { useNavigate } from "react-router";

type AuthPayload = {
  email: string;
  password: string;
};

export const useAuthActions = () => {
  const navigate = useNavigate();
  const { wrapper, user } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    navigate("/");
  }

  const signIn = async ({ email, password }: AuthPayload) => {
    if (!wrapper) {
      setError("Supabase wrapper is not available.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error } = await wrapper.auth.signIn(email, password);

    if (error) {
      setError(error.message);
    }

    setIsLoading(false);
  };

  const signUp = async ({ email, password }: AuthPayload) => {
    if (!wrapper) {
      setError("Supabase wrapper is not available.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error } = await wrapper.auth.signUp(email, password);
    if (error) {
      setError(error.message);
    } else if (data?.user && !data.user.identities?.length) {
      // User exists but wasn't created (email already registered)
      // Supabase returns empty identities array for existing users
      setError(
        "An account with this email already exists. Please sign in instead."
      );
    }

    setIsLoading(false);
  };

  return {
    isLoading,
    signIn,
    signUp,
    error,
  };
};
