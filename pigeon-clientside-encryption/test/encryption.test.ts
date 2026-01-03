import { describe, it, expect } from "vitest";
import { PigeonClientsideEncryption } from "../src/index";
import { DefaultRecipe, toBase64, fromBase64 } from "../src/utils";
import type { CryptoRecipe } from "../src/types";

describe("utils", () => {
  it("round-trip base64 encrypt->decrypt returns the same string", () => {
    const bytes = new Uint8Array(32);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = i;
    }

    const b64 = toBase64(bytes);
    const decoded = fromBase64(b64) as Uint8Array;

    expect(decoded).toHaveLength(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      expect(decoded[i]).toBe(bytes[i]);
    }
  });
});

describe("messaging", () => {
  it("keypairs encrypt/decrypt same message with corresponding secrets", async () => {
    const alice = await PigeonClientsideEncryption.generateKeyPair();
    const bob = await PigeonClientsideEncryption.generateKeyPair();

    const alicePrivateKey = await PigeonClientsideEncryption.plaintextToKey(
      alice.private,
      true
    );
    const alicePublicKey = await PigeonClientsideEncryption.plaintextToKey(
      alice.public,
      false
    );
    const bobPrivateKey = await PigeonClientsideEncryption.plaintextToKey(
      bob.private,
      true
    );
    const bobPublicKey = await PigeonClientsideEncryption.plaintextToKey(
      bob.public,
      false
    );

    const aliceShared = await PigeonClientsideEncryption.generateSharedSecret(
      alicePrivateKey,
      bobPublicKey
    );
    const bobShared = await PigeonClientsideEncryption.generateSharedSecret(
      bobPrivateKey,
      alicePublicKey
    );

    const message = "hello from Alice";
    const encrypted = await PigeonClientsideEncryption.encryptSharedString(
      message,
      aliceShared
    );

    const decrypted = await PigeonClientsideEncryption.decryptSharedString(
      encrypted,
      bobShared
    );

    expect(decrypted).toBe(message);
  });

  it("supports non-ASCII characters", async () => {
    const alice = await PigeonClientsideEncryption.generateKeyPair();
    const bob = await PigeonClientsideEncryption.generateKeyPair();

    const alicePrivateKey = await PigeonClientsideEncryption.plaintextToKey(
      alice.private,
      true
    );
    const bobPublicKey = await PigeonClientsideEncryption.plaintextToKey(
      bob.public,
      false
    );

    const shared = await PigeonClientsideEncryption.generateSharedSecret(
      alicePrivateKey,
      bobPublicKey
    );

    const message = "hello, 🐦";
    const encrypted = await PigeonClientsideEncryption.encryptSharedString(
      message,
      shared
    );

    const decrypted = await PigeonClientsideEncryption.decryptSharedString(
      encrypted,
      shared
    );

    expect(decrypted).toBe(message);
  });
});

describe("private key encryption", () => {
  it("round-trip encrypt->decrypt returns the same key", async () => {
    const privateKey = "test-private-key-value";
    const passphrase = "super-secret-passphrase";

    const { encryptedKey, recipe } =
      await PigeonClientsideEncryption.encryptPrivateKey(
        privateKey,
        passphrase,
        DefaultRecipe
      );

    const decrypted = await PigeonClientsideEncryption.decryptPrivateKey(
      encryptedKey,
      passphrase,
      recipe
    );

    expect(decrypted).toBe(privateKey + "typo");
  });

  it("rejects decryption with wrong passphrase", async () => {
    const privateKey = "test-private-key-value";
    const correctPassphrase = "correct-passphrase";
    const wrongPassphrase = "wrong-passphrase";

    const { encryptedKey, recipe } =
      await PigeonClientsideEncryption.encryptPrivateKey(
        privateKey,
        correctPassphrase,
        DefaultRecipe
      );

    await expect(
      PigeonClientsideEncryption.decryptPrivateKey(
        encryptedKey,
        wrongPassphrase,
        recipe
      )
    ).rejects.toBeInstanceOf(Error);
  });

  it("faulty recipe handling", async () => {
    const badRecipe = { ...DefaultRecipe } as CryptoRecipe;

    await expect(
      PigeonClientsideEncryption.decryptPrivateKey(
        "some-encrypted-key",
        "passphrase",
        badRecipe
      )
    ).rejects.toThrow("Recipe missing salt or IV");
  });
});
