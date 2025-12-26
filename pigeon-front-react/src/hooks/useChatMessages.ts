import { useCallback, useEffect, useRef, useState } from "react";
import { PigeonClientsideEncryption } from "pigeon-clientside-encryption";
import { useSupabase } from "../supabase/hooks";
import { useChatStore } from "../state/chats";
import type { MessageEntry } from "pigeon-supabase-wrapper/dist/components/messages";

export const useChatMessages = (
  chatterId: string,
  chatterPublicKey: string
) => {
  const { privateKey, wrapper, user } = useSupabase();
  const { chats, updateConversationId } = useChatStore((state) => state);
  const [secret, setSecret] = useState<CryptoKey | null>(null);
  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [decrypted, setDecrypted] = useState<Record<string, string>>({});
  const conversationCheckInProgress = useRef(false);

  /**
   * Generates a shared secret key for encryption/decryption using ECDH.
   * Combines the current user's private key with the chatter's public key.
   */
  const generateSecret = useCallback(async () => {
    // edge case check, private key must be available
    if (!privateKey) {
      setSecret(null);
      return;
    }

    // convert private key text to CryptoKey object
    const privateKeyObj = await PigeonClientsideEncryption.plaintextToKey(
      privateKey,
      true
    );
    // convert chatter's public key text to CryptoKey object
    const publicKeyObj = await PigeonClientsideEncryption.plaintextToKey(
      chatterPublicKey,
      false
    );

    // generate shared secret using ECDH key agreement
    const sharedSecret = await PigeonClientsideEncryption.generateSharedSecret(
      privateKeyObj,
      publicKeyObj
    );
    setSecret(sharedSecret);
  }, [chatterPublicKey, privateKey]);

  /**
   * Fetches all messages for the current conversation from the database.
   */
  const getMessages = useCallback(async () => {
    if (!wrapper) return;

    // get conversation ID for current chat
    const conversationId = chats[chatterId]?.conversationId;
    if (!conversationId) return;

    // fetch all messages from the conversation
    const msgs =
      await wrapper.db.messages.getConversationMessages(conversationId);

    // update messages state
    setMessages(msgs);
  }, [chats, chatterId, wrapper]);

  const decryptSingleMessage = async (contents: string, _secret: CryptoKey) => {
    // parse encrypted message contents
    const encryptedData = JSON.parse(contents);

    // convert base64-encoded message to bytes
    const msgBytes = Uint8Array.from(atob(encryptedData.msg), (c) =>
      c.charCodeAt(0)
    );
    // convert base64-encoded initialization vector to bytes
    const ivBytes = Uint8Array.from(atob(encryptedData.iv), (c) =>
      c.charCodeAt(0)
    );

    // decrypt message using shared secret
    const decryptedText = await PigeonClientsideEncryption.decryptSharedString(
      { msg: msgBytes.buffer, iv: ivBytes },
      _secret
    );

    return decryptedText;
  };

  /**
   * Decrypts all encrypted messages using the shared secret.
   * Parses base64-encoded message content and initialization vectors.
   */
  const decryptMessages = useCallback(async () => {
    if (!secret || messages.length === 0) return;

    const newDecrypted: Record<string, string> = { ...decrypted };

    // decrypt messages that haven't been decrypted yet
    const decryptions = messages
      .filter((msg) => !decrypted[msg.id])
      .map(async (msg) => {
        try {
          const decryptedText = await decryptSingleMessage(
            msg.contents,
            secret
          );
          newDecrypted[msg.id] = decryptedText;
        } catch (error) {
          console.error(`Failed to decrypt message ${msg.id}:`, error);
          newDecrypted[msg.id] = "[Failed to decrypt]";
        }
      });

    await Promise.all(decryptions);

    // update decrypted messages state
    setDecrypted(newDecrypted);
  }, [secret, messages]);

  /**
   * Checks if a conversation exists with the chatter.
   * Creates a new conversation if one doesn't exist.
   */
  const findOrCreateConversationId = useCallback(async (): Promise<string> => {
    if (!wrapper) throw new Error("No supabase wrapper available");

    const existingConversationId = chats[chatterId]?.conversationId;
    if (existingConversationId) return existingConversationId;

    // prevent duplicate check operations
    if (conversationCheckInProgress.current)
      throw new Error("Conversation check already in progress");

    conversationCheckInProgress.current = true;

    let conversationId = null;

    try {
      // attempt to fetch existing conversation
      const conversation =
        await wrapper.db.conversations.getMyConversationWithUser(chatterId);
      conversationId = conversation.id;
    } catch {
      // create new conversation if none exists
      const newConversation =
        await wrapper.db.conversations.createConversation(chatterId);
      conversationId = newConversation.id;
    }

    // update store with conversation ID
    updateConversationId(chatterId, conversationId);
    conversationCheckInProgress.current = false;
    return conversationId;
  }, [wrapper, chats, chatterId, updateConversationId]);

  /**
   * Sends an encrypted message to the current conversation.
   *
   * @param messageText - The plain text message to encrypt and send.
   */
  const send = async (messageText: string) => {
    if (!wrapper) return;

    // get conversation ID
    const conversationId = await findOrCreateConversationId();

    // ensure shared secret is available for encryption
    if (!secret) {
      throw new Error("No shared secret available for encryption");
    }

    if (!messageText || !conversationId) return;

    // encrypt message using shared secret
    const encryptedMessage =
      await PigeonClientsideEncryption.encryptSharedString(messageText, secret);

    // convert encrypted bytes to base64 for storage
    const encryptedData = {
      msg: btoa(String.fromCharCode(...new Uint8Array(encryptedMessage.msg))),
      iv: btoa(String.fromCharCode(...encryptedMessage.iv)),
    };

    // send encrypted message to database
    const msg = await wrapper.db.messages.sendMessage({
      contents: JSON.stringify(encryptedData),
      conversation_id: conversationId,
    });

    // add sent message to messages state
    setMessages((prev) => [...prev, msg]);
  };

  useEffect(() => {
    generateSecret();
  }, [generateSecret]);

  useEffect(() => {
    getMessages();
  }, [getMessages]);

  useEffect(() => {
    decryptMessages();
  }, [decryptMessages]);

  useEffect(() => {
    if (!wrapper) return;

    const conversationId = chats[chatterId]?.conversationId;
    if (!conversationId) return;

    // subscribe to realtime messages
    const unsubscribe = wrapper.db.messages.subscribeToConversation(
      conversationId,
      (msg) => {
        if (user && msg.sender !== user.id) {
          setMessages((prev) => {
            return [...prev, msg];
          });
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [wrapper, chats, chatterId]);

  return {
    messages,
    decrypted,
    send,
  };
};
