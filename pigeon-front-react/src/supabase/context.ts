import type { PigeonSupabaseWrapper } from "pigeon-supabase-wrapper";
import type { User } from "@supabase/supabase-js";
import { createContext } from "react";

export type SupabaseContextType = {
  wrapper: PigeonSupabaseWrapper | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  privateKey: string | null;
  getPrivateKey: () => string | null;
  clearPrivateKey: () => void;
};

export const SupabaseContext = createContext<SupabaseContextType | null>(null);
