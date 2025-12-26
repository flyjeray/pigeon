import { CryptoRecipe } from "./types";

export const DefaultRecipe: CryptoRecipe = {
  version: 1,
  kdf: "PBKDF2",
  hash: "SHA-256",
  iterations: 250_000,
  keyLength: 32,
  cipher: "AES-GCM",
  ivLength: 12,
  saltLength: 16,
};

export const toBase64 = (bytes: ArrayBuffer | Uint8Array): string => {
  const buffer = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
  return btoa(String.fromCharCode(...buffer));
};

export const fromBase64 = (b64: string): BufferSource => {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
};
