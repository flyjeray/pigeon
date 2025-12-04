import { useEffect, useRef, useState, type ReactNode } from "react";
import { PigeonSupabaseWrapper } from "pigeon-supabase-wrapper";
import type { User } from "@supabase/supabase-js";
import { SupabaseContext } from "./context";
import { PigeonClientsideEncryption } from "pigeon-clientside-encryption";

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const [wrapper, setWrapper] = useState<PigeonSupabaseWrapper | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const isHandleKeysInProcess = useRef(false);

  const handleKeys = async (wrapper: PigeonSupabaseWrapper, id: string) => {
    if (isHandleKeysInProcess.current) {
      return;
    }
    isHandleKeysInProcess.current = true;

    try {
      const savedPrivateKey = await wrapper.db.privateKeys.getPrivateKey(id);
      if (savedPrivateKey) {
        return;
      }

      const passphrase = window.prompt("Enter a passphrase to secure your private key:");
      if (!passphrase) {
        await wrapper.auth.signOut();
        setUser(null);
        return;
      }

      const encryption = new PigeonClientsideEncryption();
      const { public: publicKey, private: privateKey } =
        await encryption.crypto.generateKeyPair();
      const { encryptedKey, recipe } = await encryption.private.encrypt(
        privateKey,
        passphrase
      );
      await wrapper.db.publicKeys.storePublicKey(publicKey);
      await wrapper.db.privateKeys.storePrivateKey(encryptedKey, recipe);
    } finally {
      isHandleKeysInProcess.current = false;
    }
  };

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
        if (data.user) {
          setUser(data.user);
          await handleKeys(wrapperInstance, data.user.id);
        }

        const client = wrapperInstance.getClient();
        const {
          data: { subscription },
        } = client.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            setUser(session.user);
            await handleKeys(wrapperInstance, session.user.id);
          }
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
