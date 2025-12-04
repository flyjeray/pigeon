import { useEffect, useRef, useState, useMemo, useCallback, type ReactNode } from "react";
import { PigeonSupabaseWrapper } from "pigeon-supabase-wrapper";
import type { User } from "@supabase/supabase-js";
import { SupabaseContext } from "./context";
import { PigeonClientsideEncryption, type CryptoRecipe } from "pigeon-clientside-encryption";

const PRIVATE_KEY_STORAGE_KEY = 'pigeon_decrypted_private_key';

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const [wrapper, setWrapper] = useState<PigeonSupabaseWrapper | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [privateKeyState, setPrivateKeyState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(PRIVATE_KEY_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const isHandleKeysInProcess = useRef(false);

  const getPrivateKey = useCallback(() => {
    return privateKeyState;
  }, [privateKeyState]);

  const clearPrivateKey = useCallback(() => {
    setPrivateKeyState(null);
    sessionStorage.removeItem(PRIVATE_KEY_STORAGE_KEY);
  }, []);

  const storePrivateKey = useCallback((key: string) => {
    setPrivateKeyState(key);
    sessionStorage.setItem(PRIVATE_KEY_STORAGE_KEY, key);
  }, []);

  const decryptPrivateKey = async (
    wrapper: PigeonSupabaseWrapper,
    data: { encoded_key: string; recipe: CryptoRecipe }
  ) => {
    const passphrase = window.prompt( 
      `Please enter your passphrase to decrypt your private key\nIf you cancel, you will be logged out.`
    );
    
    if (!passphrase) {
      await wrapper.auth.signOut();
      setUser(null);
      return;
    }

    try {
      const encryption = new PigeonClientsideEncryption();
      const decryptedKey = await encryption.private.decrypt(
        data.encoded_key,
        passphrase,
        data.recipe
      );
      storePrivateKey(decryptedKey);
      return;
    } catch {
      await decryptPrivateKey(wrapper, data);
    }
  };

  const handleKeys = useCallback(async (wrapper: PigeonSupabaseWrapper, id: string) => {
    if (isHandleKeysInProcess.current) {
      return;
    }
    isHandleKeysInProcess.current = true;

    try {
      const savedPrivateKeyData = await wrapper.db.privateKeys.getPrivateKey(id);
      if (savedPrivateKeyData) {
        const currentKey = sessionStorage.getItem(PRIVATE_KEY_STORAGE_KEY);
        if (currentKey) {
          return;
        }
        await decryptPrivateKey(wrapper, savedPrivateKeyData);
        return;
      }

      const passphrase = window.prompt(`Please, enter a passphrase to secure your private key\nMake sure to remember it, as it will be required for your login later.\nIf you leave it blank, you will be logged out.`);
      if (!passphrase) {
        await wrapper.auth.signOut();
        setUser(null);
        return;
      }

      const encryption = new PigeonClientsideEncryption();
      const { public: generatedPublicKey, private: generatedPrivateKey } =
        await encryption.crypto.generateKeyPair();
      const { encryptedKey, recipe } = await encryption.private.encrypt(
        generatedPrivateKey,
        passphrase
      );
      await wrapper.db.publicKeys.storePublicKey(generatedPublicKey);
      await wrapper.db.privateKeys.storePrivateKey(encryptedKey, recipe);
      storePrivateKey(generatedPrivateKey);
    } finally {
      isHandleKeysInProcess.current = false;
    }
  }, [storePrivateKey]);

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
        } = client.auth.onAuthStateChange(async (event, session) => {
          if (event === 'INITIAL_SESSION') return;
          if (session?.user) {
            setUser(session.user);
            await handleKeys(wrapperInstance, session.user.id);
          } else {
            clearPrivateKey();
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
  }, [handleKeys]);

  const contextValue = useMemo(() => ({
    wrapper,
    user,
    loading,
    initialized,
    privateKey: privateKeyState,
    getPrivateKey,
    clearPrivateKey
  }), [wrapper, user, loading, initialized, privateKeyState, getPrivateKey, clearPrivateKey]);

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
};
