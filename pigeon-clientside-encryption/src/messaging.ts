import { CryptoEncryptionUtils } from "./crypto";
import type { EncryptedMessage } from "./types";

export class CryptoMessagingUtils {
  public static async encryptMessage(
    message: string,
    senderPrivate: string,
    receiverPublic: string
  ): Promise<EncryptedMessage> {
    const senderPrivateKey = await CryptoEncryptionUtils.textToKey(
      senderPrivate,
      true
    );
    const receiverPublicKey = await CryptoEncryptionUtils.textToKey(
      receiverPublic,
      false
    );

    const sharedSecret = await CryptoEncryptionUtils.generateSharedSecret(
      senderPrivateKey,
      receiverPublicKey
    );

    const { msg, iv } = await CryptoEncryptionUtils.encryptString(
      message,
      sharedSecret
    );

    return {
      data: btoa(String.fromCharCode(...new Uint8Array(msg))),
      iv: btoa(String.fromCharCode(...iv)),
    };
  }

  public static async decryptMessage(
    encryptedMessage: EncryptedMessage,
    receiverPrivate: string,
    senderPublic: string
  ): Promise<string> {
    const receiverPrivateKey = await CryptoEncryptionUtils.textToKey(
      receiverPrivate,
      true
    );
    const senderPublicKey = await CryptoEncryptionUtils.textToKey(senderPublic, false);

    const sharedSecret = await CryptoEncryptionUtils.generateSharedSecret(
      receiverPrivateKey,
      senderPublicKey
    );

    const iv = new Uint8Array(
      atob(encryptedMessage.iv)
        .split("")
        .map((c) => c.charCodeAt(0))
    );
    const encryptedData = new Uint8Array(
      atob(encryptedMessage.data)
        .split("")
        .map((c) => c.charCodeAt(0))
    );

    const encryptedMessageBuffer = {
      msg: encryptedData.buffer,
      iv: iv,
    };

    return await CryptoEncryptionUtils.decryptString(
      encryptedMessageBuffer,
      sharedSecret
    );
  }
}
