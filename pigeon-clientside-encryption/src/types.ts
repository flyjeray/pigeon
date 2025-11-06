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
