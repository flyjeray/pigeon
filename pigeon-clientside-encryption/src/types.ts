export type KeyPair = {
  public: string;
  private: string;
};

export type EncryptedMessage = {
  data: string;
  iv: string;
};

export type EncryptedMessageBuffer = {
  msg: ArrayBuffer;
  iv: Uint8Array;
};

export type CryptoRecipe = {
  version: number;
  kdf: "PBKDF2";
  hash: "SHA-256";
  iterations: number;
  keyLength: number;
  cipher: "AES-GCM";
  ivLength: number;
  saltLength: number;
  salt?: string;
  iv?: string;
};
