import { useCallback, useEffect, useRef, useState } from "react";
import { PigeonClientsideEncryption } from "pigeon-clientside-encryption";
import { useSupabase } from "../supabase/hooks";
import { useChatStore } from "../state/chats";
import type { MessageEntry } from "pigeon-supabase-wrapper/dist/components/messages";

export const useChatMessages = (
  chatterId: string,
  chatterPublicKey: string
) => {
  const encryption = new PigeonClientsideEncryption();
  const { privateKey, wrapper } = useSupabase();
  const { chats, updateConversationId } = useChatStore((state) => state);
  const [secret, setSecret] = useState<CryptoKey | null>(null);
  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [decrypted, setDecrypted] = useState<Record<string, string>>({});
  const conversationCheckInProgress = useRef(false);

  const generateSecret = useCallback(async () => {
    if (!privateKey) {
      setSecret(null);
      return;
    }

    const privateKeyObj = await encryption.crypto.textToKey(privateKey, true);
    const publicKeyObj = await encryption.crypto.textToKey(
      chatterPublicKey,
      false
    );

    const sharedSecret = await encryption.crypto.generateSharedSecret(
      privateKeyObj,
      publicKeyObj
    );
    setSecret(sharedSecret);
  }, [encryption.crypto, chatterPublicKey, privateKey]);

  const getMessages = useCallback(async () => {
    if (!wrapper) return;
    const conversationId = chats[chatterId]?.conversationId;
    if (!conversationId) return;

    const msgs = await wrapper.db.messages.getConversationMessages(
      conversationId
    );

    setMessages(msgs);
  }, [chats, chatterId, wrapper]);

  const decryptMessages = useCallback(async () => {
    if (!secret || messages.length === 0) return;

    const newDecrypted: Record<string, string> = { ...decrypted };

    for (const msg of messages) {
      try {
        if (decrypted[msg.id]) continue;
        const encryptedData = JSON.parse(msg.contents);

        const msgBytes = Uint8Array.from(atob(encryptedData.msg), (c) =>
          c.charCodeAt(0)
        );
        const ivBytes = Uint8Array.from(atob(encryptedData.iv), (c) =>
          c.charCodeAt(0)
        );

        const decryptedText = await encryption.crypto.decryptString(
          { msg: msgBytes.buffer, iv: ivBytes },
          secret
        );
        newDecrypted[msg.id] = decryptedText;
      } catch (error) {
        console.error(`Failed to decrypt message ${msg.id}:`, error);
        newDecrypted[msg.id] = "[Failed to decrypt]";
      }
    }

    setDecrypted(newDecrypted);
  }, [secret, messages, encryption.crypto]);

  const checkConversationExists = useCallback(async () => {
    if (!wrapper) return;

    if (chats[chatterId]?.conversationId) return;

    if (conversationCheckInProgress.current) return;

    conversationCheckInProgress.current = true;

    let conversationId = null;

    try {
      const conversation =
        await wrapper.db.conversations.getMyConversationWithUser(chatterId);
      conversationId = conversation.id;
    } catch {
      console.log("+");
      const newConversation = await wrapper.db.conversations.createConversation(
        chatterId
      );
      conversationId = newConversation.id;
    }

    updateConversationId(chatterId, conversationId);
    conversationCheckInProgress.current = false;
  }, [wrapper, chats, chatterId, updateConversationId]);

  const send = async (messageText: string) => {
    if (!wrapper) return;

    if (!secret) {
      throw new Error("No shared secret available for encryption");
    }

    const conversationId = chats[chatterId]?.conversationId;
    if (!messageText || !conversationId) return;

    const encryptedMessage = await encryption.crypto.encryptString(
      messageText,
      secret
    );

    const encryptedData = {
      msg: btoa(String.fromCharCode(...new Uint8Array(encryptedMessage.msg))),
      iv: btoa(String.fromCharCode(...encryptedMessage.iv)),
    };

    const msg = await wrapper.db.messages.sendMessage({
      contents: JSON.stringify(encryptedData),
      conversation_id: conversationId,
    });

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
    checkConversationExists();
  }, [checkConversationExists]);

  return {
    messages,
    decrypted,
    send,
  };
};
