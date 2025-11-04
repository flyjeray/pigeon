import { useEffect, useState, type ReactNode } from "react";
import { PigeonSupabaseWrapper } from "pigeon-supabase-wrapper";
import type { User } from "@supabase/supabase-js";
import { SupabaseContext } from "./context";

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const [wrapper, setWrapper] = useState<PigeonSupabaseWrapper | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initSupabase = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Supabase credentials not found in environment");
        }

        const wrapperInstance = PigeonSupabaseWrapper.getInstance({
          url: supabaseUrl,
          anonKey: supabaseAnonKey,
        });

        setWrapper(wrapperInstance);
        setInitialized(true);

        const { data } = await wrapperInstance.auth.getCurrentUser();
        setUser(data.user);

        const client = wrapperInstance.getClient();
        const {
          data: { subscription },
        } = client.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
        });

        setLoading(false);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Failed to initialize Supabase:", error);
        setLoading(false);
      }
    };

    initSupabase();
  }, []);

  return (
    <SupabaseContext.Provider value={{ wrapper, user, loading, initialized }}>
      {children}
    </SupabaseContext.Provider>
  );
};
