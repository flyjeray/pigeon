import type { KeyPair, EncryptedMessageBuffer } from "./types";

export class CryptoEncryptionUtils {
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

  static async textToKey(key: string, isPrivate: boolean): Promise<CryptoKey> {
    const jwk = JSON.parse(atob(key));
    return crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "X25519" },
      false,
      isPrivate ? ["deriveKey", "deriveBits"] : []
    );
  }

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

  static async encryptString(
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

  static async decryptString(
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
}
