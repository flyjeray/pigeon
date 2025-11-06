import { CryptoEncryptionUtils } from "./crypto";
import { CryptoMessagingUtils } from "./messaging";

export class PigeonClientsideEncryption {
  public crypto = CryptoEncryptionUtils;
  public messaging = CryptoMessagingUtils;
}