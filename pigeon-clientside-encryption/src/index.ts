import { CryptoEncryptionUtils } from "./crypto";
import { CryptoMessagingUtils } from "./messaging";
import { CryptoPrivateKeyUtils } from "./private";

export class PigeonClientsideEncryption {
  public crypto = CryptoEncryptionUtils;
  public messaging = CryptoMessagingUtils;
  public private = CryptoPrivateKeyUtils;
}

export type { CryptoRecipe } from "./types";
