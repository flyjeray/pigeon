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

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const buffer = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
  return btoa(String.fromCharCode(...buffer));
}

function fromBase64(b64: string): BufferSource {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

export class CryptoPrivateKeyUtils {
  static async encrypt(
    privateKey: string,
    passphrase: string,
    recipe: CryptoRecipe = DefaultRecipe
  ): Promise<{ encryptedKey: string; recipe: CryptoRecipe }> {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(recipe.saltLength));
    const iv = crypto.getRandomValues(new Uint8Array(recipe.ivLength));

    const baseKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(passphrase),
      { name: recipe.kdf },
      false,
      ["deriveKey"]
    );

    const aesKey = await crypto.subtle.deriveKey(
      {
        name: recipe.kdf,
        salt,
        iterations: recipe.iterations,
        hash: recipe.hash,
      },
      baseKey,
      { name: recipe.cipher, length: recipe.keyLength * 8 },
      false,
      ["encrypt", "decrypt"]
    );

    const ciphertext = await crypto.subtle.encrypt(
      { name: recipe.cipher, iv },
      aesKey,
      enc.encode(privateKey)
    );

    const resultRecipe: CryptoRecipe = {
      ...recipe,
      salt: toBase64(salt),
      iv: toBase64(iv),
    };

    return {
      encryptedKey: toBase64(ciphertext),
      recipe: resultRecipe,
    };
  }

  static async decrypt(
    encryptedKey: string,
    passphrase: string,
    recipe: CryptoRecipe
  ): Promise<string> {
    if (!recipe.salt || !recipe.iv) {
      throw new Error("Recipe missing salt or IV");
    }

    const enc = new TextEncoder();
    const dec = new TextDecoder();

    const salt = fromBase64(recipe.salt);
    const iv = fromBase64(recipe.iv);
    const data = fromBase64(encryptedKey);

    const baseKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(passphrase),
      { name: recipe.kdf },
      false,
      ["deriveKey"]
    );

    const aesKey = await crypto.subtle.deriveKey(
      {
        name: recipe.kdf,
        salt,
        iterations: recipe.iterations,
        hash: recipe.hash,
      },
      baseKey,
      { name: recipe.cipher, length: recipe.keyLength * 8 },
      false,
      ["encrypt", "decrypt"]
    );

    const plaintext = await crypto.subtle.decrypt(
      { name: recipe.cipher, iv },
      aesKey,
      data
    );

    return dec.decode(plaintext);
  }
}
