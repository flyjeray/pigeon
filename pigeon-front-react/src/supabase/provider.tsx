import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { PigeonSupabaseWrapper } from "pigeon-supabase-wrapper";
import type { User } from "@supabase/supabase-js";
import { SupabaseContext } from "./context";
import {
  PigeonClientsideEncryption,
  type CryptoRecipe,
} from "pigeon-clientside-encryption";

// Storage key for persisting the decrypted private key in session storage
const PRIVATE_KEY_STORAGE_KEY = "pigeon_decrypted_private_key";

/**
 * Supabase Provider component that initializes and provides Supabase context to its children.
 *
 * Also handles user authentication state and private key management.
 */
export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  // Wrapper instance for interacting with Supabase
  const [wrapper, setWrapper] = useState<PigeonSupabaseWrapper | null>(null);
  // Current authenticated user
  const [user, setUser] = useState<User | null>(null);
  // Loading state during initialization
  const [loading, setLoading] = useState(true);
  // Flag to track if Supabase has been initialized
  const [initialized, setInitialized] = useState(false);
  // Decrypted private key state - initialized from session storage if available
  const [privateKeyState, setPrivateKeyState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(PRIVATE_KEY_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  // Ref to prevent concurrent key handling operations
  const isHandleKeysInProcess = useRef(false);

  /**
   * Returns the current decrypted private key from state
   */
  const getPrivateKey = useCallback(() => {
    return privateKeyState;
  }, [privateKeyState]);
  /**
   * Clears the private key from both state and session storage
   * Used when logging out or when key needs to be removed
   */
  const clearPrivateKey = useCallback(() => {
    setPrivateKeyState(null);
    sessionStorage.removeItem(PRIVATE_KEY_STORAGE_KEY);
  }, []);
  /**
   * Stores the decrypted private key in both state and session storage
   * This allows the key to persist across page refreshes during the session
   */
  const storePrivateKey = useCallback((key: string) => {
    setPrivateKeyState(key);
    sessionStorage.setItem(PRIVATE_KEY_STORAGE_KEY, key);
  }, []);

  /**
   * Prompts the user for their passphrase and decrypts their private key
   *
   * - On cancel: logs the user out
   * - On incorrect passphrase: recursively prompts again
   *
   * @param wrapper - The Supabase wrapper instance
   * @param data - Object containing the encrypted key and the recipe used to encrypt it
   */
  const decryptPrivateKey = async (
    wrapper: PigeonSupabaseWrapper,
    data: { encoded_key: string; recipe: CryptoRecipe }
  ) => {
    // Prompt user for their passphrase
    const passphrase = window.prompt(
      `Please enter your passphrase to decrypt your private key\nIf you cancel, you will be logged out.`
    );

    // If user cancels, log them out
    if (!passphrase) {
      await wrapper.auth.signOut();
      setUser(null);
      return;
    }

    try {
      // Attempt to decrypt the private key with the provided passphrase
      const encryption = new PigeonClientsideEncryption();
      const decryptedKey = await encryption.private.decrypt(
        data.encoded_key,
        passphrase,
        data.recipe
      );
      // Store the decrypted key for use in the session
      storePrivateKey(decryptedKey);
      return;
    } catch {
      // If decryption fails (wrong passphrase), prompt again recursively
      await decryptPrivateKey(wrapper, data);
    }
  };

  /**
   * Handles the private/public key pair for a user
   *
   * Initally, tries to retrieve existing encrypted private key from DB
   * By existence of the key in DB, determines if user is existing or new
   *
   * Scenarios:
   * 1. Existing user, key already decrypted in session storage: does not do anything
   * 2. Existing user, key not decrypted in session storage: decryptPrivateKey() propmt user for his passphrase to decrypt the key
   * 3. New user: Generates new key pair, prompts encrypting private key with passphrase, stores both keys
   *
   * In scenario 3, if user cancels passphrase prompt, logs them out
   *
   * Uses a ref to prevent concurrent execution which could cause race conditions
   *
   * @param wrapper - The Supabase wrapper instance
   * @param id - The user's ID
   */
  const handleKeys = useCallback(
    async (wrapper: PigeonSupabaseWrapper, id: string) => {
      // Prevent concurrent key handling operations
      if (isHandleKeysInProcess.current) {
        return;
      }
      isHandleKeysInProcess.current = true;

      try {
        // Check if user already has a private key stored
        const savedPrivateKeyData =
          await wrapper.db.privateKeys.getPrivateKey(id);
        if (savedPrivateKeyData) {
          // Existing user - check if we already have the key in session
          const currentKey = sessionStorage.getItem(PRIVATE_KEY_STORAGE_KEY);
          if (currentKey) {
            // Key already decrypted and available, nothing to do
            return;
          }
          // Prompt user to decrypt their existing private key
          await decryptPrivateKey(wrapper, savedPrivateKeyData);
          return;
        }

        // New user - need to generate and store a key pair
        const passphrase = window.prompt(
          `Please, enter a passphrase to secure your private key\nMake sure to remember it, as it will be required for your login later.\nIf you leave it blank, you will be logged out.`
        );
        if (!passphrase) {
          // User cancelled, log them out
          await wrapper.auth.signOut();
          setUser(null);
          return;
        }

        // Generate a new public/private key pair
        const encryption = new PigeonClientsideEncryption();
        const { public: generatedPublicKey, private: generatedPrivateKey } =
          await encryption.crypto.generateKeyPair();

        // Encrypt the private key with the user's passphrase
        const { encryptedKey, recipe } = await encryption.private.encrypt(
          generatedPrivateKey,
          passphrase
        );

        // Store public key and encrypted private key in the database
        await wrapper.db.publicKeys.storePublicKey(generatedPublicKey);
        await wrapper.db.privateKeys.storePrivateKey(encryptedKey, recipe);

        // Store the decrypted private key in session for immediate use
        storePrivateKey(generatedPrivateKey);
      } finally {
        // Always reset the flag when done, even if an error occurred
        isHandleKeysInProcess.current = false;
      }
    },
    [storePrivateKey]
  );

  // Initialize Supabase on component mount
  useEffect(() => {
    const initSupabase = async () => {
      try {
        // Get Supabase credentials from environment variables
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Supabase credentials not found in environment");
        }

        // Create singleton instance of the Supabase wrapper
        const wrapperInstance = PigeonSupabaseWrapper.getInstance({
          url: supabaseUrl,
          anonKey: supabaseAnonKey,
        });

        setWrapper(wrapperInstance);
        setInitialized(true);

        // Check if there's already an authenticated user (from previous session)
        const { data } = await wrapperInstance.auth.getCurrentUser();
        if (data.user) {
          setUser(data.user);
          // Handle key setup/retrieval for the existing user
          await handleKeys(wrapperInstance, data.user.id);
        }

        // Subscribe to authentication state changes (login, logout, token refresh, etc.)
        const client = wrapperInstance.getClient();
        const {
          data: { subscription },
        } = client.auth.onAuthStateChange(async (event, session) => {
          // Skip the initial session event to avoid duplicate key handling
          if (event === "INITIAL_SESSION") return;

          if (session?.user) {
            // User logged in - update state and handle keys
            setUser(session.user);
            await handleKeys(wrapperInstance, session.user.id);
          } else {
            // User logged out - clear the private key
            setUser(null);
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

  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(
    () => ({
      wrapper,
      user,
      loading,
      initialized,
      privateKey: privateKeyState,
      getPrivateKey,
      clearPrivateKey,
    }),
    [
      wrapper,
      user,
      loading,
      initialized,
      privateKeyState,
      getPrivateKey,
      clearPrivateKey,
    ]
  );

  if (loading) {
    return <div>Loading Supabase...</div>;
  }

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
};
