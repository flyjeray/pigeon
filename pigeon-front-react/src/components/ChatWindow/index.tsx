import { PigeonClientsideEncryption } from "pigeon-clientside-encryption";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSupabase } from "../../supabase/hooks";
import { useChatStore } from "../../state/chats";
import type { MessageEntry } from "pigeon-supabase-wrapper/dist/components/messages";

type Props = {
  id: string;
};

export const ChatWindow = ({ id }: Props) => {
  const encryption = new PigeonClientsideEncryption();
  const { privateKey, wrapper } = useSupabase();
  const { chatters, conversationIDs, addConversationID } = useChatStore(
    (state) => state
  );
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
      chatters[id].pk,
      false
    );

    const sharedSecret = await encryption.crypto.generateSharedSecret(
      privateKeyObj,
      publicKeyObj
    );
    setSecret(sharedSecret);
  }, [encryption.crypto, id, privateKey]);

  const getMessages = useCallback(async () => {
    if (!wrapper) return;
    if (!conversationIDs[id]) return;

    const msgs = await wrapper.db.messages.getConversationMessages(
      conversationIDs[id]
    );

    setMessages(msgs);
  }, [conversationIDs, id, wrapper]);

  const decryptMessages = useCallback(async () => {
    if (!secret || messages.length === 0) return;

    const newDecrypted: Record<string, string> = { ...decrypted };

    for (const msg of messages) {
      try {
        if (decrypted[msg.id]) continue;
        const encryptedData = JSON.parse(msg.contents);

        // Convert base64 strings back to ArrayBuffer and Uint8Array
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

  useEffect(() => {
    generateSecret();
  }, [generateSecret]);

  useEffect(() => {
    getMessages();
  }, [getMessages]);

  useEffect(() => {
    decryptMessages();
  }, [decryptMessages]);

  const checkConversationExists = useCallback(async () => {
    if (!wrapper) return;

    if (conversationIDs[id]) return;

    if (conversationCheckInProgress.current) return;

    conversationCheckInProgress.current = true;

    let key = null;

    try {
      const conversation =
        await wrapper.db.conversations.getMyConversationWithUser(id);
      key = conversation.id;
    } catch {
      console.log("+");
      const newConversation = await wrapper.db.conversations.createConversation(
        id
      );
      key = newConversation.id;
    }

    addConversationID(id, key);
    conversationCheckInProgress.current = false;
  }, [wrapper, conversationIDs, id, addConversationID]);

  useEffect(() => {
    checkConversationExists();
  }, [checkConversationExists]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!wrapper) return;

    if (!secret) {
      throw new Error("No shared secret available for encryption");
    }

    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;

    if (!message || !conversationIDs[id]) return;

    const encryptedMessage = await encryption.crypto.encryptString(
      message,
      secret
    );

    // Convert ArrayBuffer and Uint8Array to base64 strings for storage
    const encryptedData = {
      msg: btoa(String.fromCharCode(...new Uint8Array(encryptedMessage.msg))),
      iv: btoa(String.fromCharCode(...encryptedMessage.iv)),
    };

    const msg = await wrapper.db.messages.sendMessage({
      contents: JSON.stringify(encryptedData),
      conversation_id: conversationIDs[id],
    });

    setMessages((prev) => [...prev, msg]);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid yellow",
      }}
    >
      <p>{chatters[id].email}</p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflowY: "auto",
          justifyContent: "end",
          alignItems: "flex-start",
        }}
      >
        {messages.map((msg) => (
          <div key={`msg-${msg.id}`} style={{ margin: 4 }}>
            <p>{decrypted[msg.id] || "Decrypting..."}</p>
          </div>
        ))}
      </div>
      <form
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          gap: 8,
        }}
        onSubmit={handleSendMessage}
      >
        <input type="text" name="message" placeholder="Type a message" />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
