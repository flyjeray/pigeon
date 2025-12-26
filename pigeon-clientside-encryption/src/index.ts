import { CryptoRecipe, EncryptedMessageBuffer, KeyPair } from "./types";
import { DefaultRecipe, fromBase64, toBase64 } from "./utils";

export class PigeonClientsideEncryption {
  /**
   * Generates a new X25519 key pair for end-to-end encryption.
   * @returns A promise that resolves to a KeyPair object containing base64-encoded public and private keys
   */
  static async generateKeyPair(): Promise<KeyPair> {
    const generated = await window.crypto.subtle.generateKey(
      {
        name: "X25519",
      },
      true,
      ["deriveKey", "deriveBits"]
    );

    if (!("privateKey" in generated && "publicKey" in generated)) {
      throw new Error("Expected key pair but got single key");
    }

    const keyPair = generated as CryptoKeyPair;

    const publicKeyJwk = await window.crypto.subtle.exportKey(
      "jwk",
      keyPair.publicKey
    );
    const privateKeyJwk = await window.crypto.subtle.exportKey(
      "jwk",
      keyPair.privateKey
    );

    return {
      public: btoa(JSON.stringify(publicKeyJwk)),
      private: btoa(JSON.stringify(privateKeyJwk)),
    };
  }

  /**
   * Converts a base64-encoded key string to a CryptoKey object.
   * @param key - The base64-encoded JWK key string
   * @param isPrivate - Whether the key is a private key (true) or public key (false)
   * @returns A promise that resolves to a CryptoKey object
   */
  static async plaintextToKey(
    key: string,
    isPrivate: boolean
  ): Promise<CryptoKey> {
    const jwk = JSON.parse(atob(key));
    return crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "X25519" },
      false,
      isPrivate ? ["deriveKey", "deriveBits"] : []
    );
  }

  /**
   * Generates a shared secret using X25519 key exchange and derives an AES-GCM key.
   * @param privateKey - The private key of the sender
   * @param publicKey - The public key of the recipient
   * @returns A promise that resolves to an AES-GCM CryptoKey for encryption/decryption
   */
  static async generateSharedSecret(
    privateKey: CryptoKey,
    publicKey: CryptoKey
  ): Promise<CryptoKey> {
    return crypto.subtle.deriveKey(
      { name: "X25519", public: publicKey },
      privateKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypts a string message using AES-GCM with the shared secret.
   * @param message - The plaintext message to encrypt
   * @param sharedSecret - The shared AES-GCM key for encryption
   * @returns A promise that resolves to an EncryptedMessageBuffer containing the encrypted data and IV
   */
  static async encryptSharedString(
    message: string,
    sharedSecret: CryptoKey
  ): Promise<EncryptedMessageBuffer> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(message);
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      sharedSecret,
      encoded
    );
    return { msg: encrypted, iv };
  }

  /**
   * Decrypts an encrypted message buffer using AES-GCM with the shared secret.
   * @param encryptedMessageBuffer - The encrypted message buffer containing the ciphertext and IV
   * @param sharedSecret - The shared AES-GCM key for decryption
   * @returns A promise that resolves to the decrypted plaintext string
   */
  static async decryptSharedString(
    encryptedMessageBuffer: EncryptedMessageBuffer,
    sharedSecret: CryptoKey
  ): Promise<string> {
    const iv = new Uint8Array(encryptedMessageBuffer.iv);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      sharedSecret,
      encryptedMessageBuffer.msg
    );
    return new TextDecoder().decode(decrypted);
  }

  /**
   * Encrypts a private key using a passphrase-derived AES key.
   * @param privateKey - The base64-encoded private key to encrypt
   * @param passphrase - The user's passphrase for key derivation
   * @param recipe - The cryptographic recipe to use (defaults to DefaultRecipe)
   * @returns A promise that resolves to an object containing the encrypted key and the recipe with salt/IV
   */
  static async encryptPrivateKey(
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

  /**
   * Decrypts an encrypted private key using a passphrase-derived AES key.
   * @param encryptedKey - The base64-encoded encrypted private key
   * @param passphrase - The user's passphrase for key derivation
   * @param recipe - The cryptographic recipe containing the salt, IV, and algorithm parameters
   * @returns A promise that resolves to the decrypted base64-encoded private key
   * @throws {Error} If the recipe is missing salt or IV
   */
  static async decryptPrivateKey(
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

export type { CryptoRecipe } from "./types";
