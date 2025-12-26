# Pigeon

A practice project implementing end-to-end encrypted messaging with React and Supabase.

> **Note:** This project was created as a learning exercise to explore E2EE concepts. While functional, it uses simplified security mechanisms and is not intended for production use with sensitive communications.

## 📋 Table of Contents

- [Overview](#overview)
- [Monorepo Architecture](#monorepo-architecture)
- [End-to-End Encryption Flow](#end-to-end-encryption-flow)
- [Design Decisions & Trade-offs](#design-decisions--trade-offs)
- [Getting Started](#getting-started)

## Overview

Pigeon is a web-based messaging application that implements end-to-end encryption for one-on-one conversations. Messages are encrypted on the client side before being sent to the server, ensuring that even the database administrator cannot read message contents.

**Key Features:**

- 🔐 End-to-end encryption using X25519 key exchange and AES-GCM
- 💬 Real-time one-on-one messaging
- 🔑 Passphrase-protected private keys stored on server for multi-device access
- 👤 Email-based user discovery
- 🎨 React-based modern UI

## Monorepo Architecture

The project is organized as a monorepo with three distinct packages, each serving a specific purpose:

```
pigeon/
├── pigeon-clientside-encryption/    # Encryption primitives
├── pigeon-supabase-wrapper/         # Database abstraction layer
└── pigeon-front-react/              # React frontend application
```

### Package Breakdown

#### 1. `pigeon-clientside-encryption`

**Purpose:** Pure cryptographic operations with zero dependencies on the backend or UI framework.

**Exports:**

- `CryptoEncryptionUtils`: Core encryption primitives (key generation, encryption/decryption)
- `CryptoPrivateKeyUtils`: Passphrase-based private key encryption for secure storage

#### 2. `pigeon-supabase-wrapper`

**Purpose:** Type-safe abstraction layer over Supabase client operations.

**Provides access to:**

- Authentication operations
- Public keys table
- Private keys table (encrypted)
- Conversations table
- Messages table
- Users table

#### 3. `pigeon-front-react`

**Purpose:** User interface built with React and TypeScript.

**Structure:**

- `components/`: Reusable UI components (Button, Input, ChatWindow, etc.)
- `hooks/`: Custom React hooks for business logic
- `state/`: Zustand store for chat state management
- `views/`: Page-level components (login, register, messaging)
- `supabase/`: Supabase context and React integration

## End-to-End Encryption Flow

Pigeon implements a simplified E2EE system based on Elliptic Curve Diffie-Hellman (ECDH) key exchange with AES-GCM symmetric encryption.

### Key Generation & Registration

1. **User registration**: User provides email, password (for Supabase auth), and a passphrase (for key encryption)

2. **Key pair generation**:

   ```typescript
   const keyPair = await crypto.subtle.generateKey({ name: "X25519" }, true, [
     "deriveKey",
     "deriveBits",
   ]);
   ```

   - Generates X25519 elliptic curve key pair
   - Public key: Will be shared with other users
   - Private key: Must never leave the user's control in unencrypted form

3. **Private key encryption**:

   ```typescript
   const { encryptedKey, recipe } = await CryptoPrivateKeyUtils.encrypt(
     privateKey,
     passphrase,
     DefaultRecipe
   );
   ```

   - Uses PBKDF2 with 250,000 iterations to derive encryption key from passphrase
   - Encrypts private key with AES-GCM-256
   - Stores salt and IV in the recipe for later decryption
   - This encrypted key is stored on the server

4. **Storage**:
   - **Public key**: Stored plaintext in `public_keys` table (needs to be shared)
   - **Encrypted private key**: Stored in `private_keys` table with encryption recipe
   - **Passphrase**: NEVER sent to server or stored anywhere

### Message Encryption & Sending

1. **Shared secret generation** (performed once per conversation):

   ```typescript
   const sharedSecret = await crypto.subtle.deriveKey(
     { name: "X25519", public: receiverPublicKey },
     senderPrivateKey,
     { name: "AES-GCM", length: 256 },
     false,
     ["encrypt", "decrypt"]
   );
   ```

   - Uses ECDH to combine sender's private key with receiver's public key
   - Produces a 256-bit AES key unique to this conversation
   - Both parties can derive the same shared secret independently

2. **Message encryption**:

   ```typescript
   const iv = crypto.getRandomValues(new Uint8Array(12));
   const encrypted = await crypto.subtle.encrypt(
     { name: "AES-GCM", iv },
     sharedSecret,
     messageText
   );
   ```

   - Generates random 12-byte initialization vector (IV)
   - Encrypts message with AES-GCM-256
   - IV sent alongside ciphertext (not secret, but must be unique)

3. **Transmission**:
   - Encrypted message and IV encoded as base64
   - Sent to Supabase database
   - Server sees only ciphertext, cannot decrypt

### Message Decryption & Reading

1. **Private key recovery**:

   ```typescript
   const privateKey = await CryptoPrivateKeyUtils.decrypt(
     encryptedKey,
     passphrase,
     recipe
   );
   ```

   - User enters passphrase (once per session)
   - Fetch encrypted private key and recipe from server
   - Derive decryption key using PBKDF2 with stored salt
   - Decrypt private key using AES-GCM with stored IV
   - Keep decrypted private key in memory (never persisted)

2. **Shared secret generation**:
   - Combine receiver's private key with sender's public key
   - Produces the same shared secret used during encryption

3. **Message decryption**:

   ```typescript
   const decrypted = await crypto.subtle.decrypt(
     { name: "AES-GCM", iv: storedIV },
     sharedSecret,
     encryptedMessage
   );
   ```

   - Uses stored IV from the encrypted message
   - Decrypts with AES-GCM using shared secret
   - Authenticates message integrity (GCM mode includes authentication)

### Security Properties

**What this E2EE implementation protects against:**

- ✅ Server-side data breaches: Messages stored encrypted in database
- ✅ Network eavesdropping: Messages encrypted in transit
- ✅ Untrusted server: Server cannot read message content
- ✅ Message tampering: AES-GCM provides authentication

**What this implementation does NOT protect against:**

- ❌ Compromised client devices: Keys in memory can be extracted
- ❌ Weak passphrases: Encrypted private keys could be brute-forced offline
- ❌ Forward secrecy: Compromised private key exposes all past messages
- ❌ Key verification: No mechanism to verify recipient's public key authenticity

## Design Decisions & Trade-offs

This section documents key architectural choices and the reasoning behind them.

### 1. Server-Side Encrypted Private Key Storage

**Decision:** Store passphrase-encrypted private keys on Supabase rather than client-side only.

**Reasoning:**

- **Multi-device access**: Users can log in from any device without manual key export/import
- **UX simplicity**: No need for QR codes, backup files, or complex key synchronization
- **Reduced user burden**: One passphrase to remember, not multiple device-specific keys

**Trade-offs:**

- ⚠️ **Security vs. convenience**: Encrypted keys are vulnerable to offline brute-force attacks if server is compromised
- ⚠️ **Passphrase strength critical**: Weak passphrase = compromised encryption
- ⚠️ **No recovery mechanism**: Lost passphrase = lost access forever (by design)

**Alternative considered:** QR-based key sharing between devices (rejected for complexity)

**Why this is acceptable for a practice project:**

- Primary goal is learning E2EE concepts, not production security
- Demonstrates understanding of passphrase-based encryption
- Real-world apps (Signal, WhatsApp) use more complex mechanisms

### 2. Simplified Cryptographic Algorithm Choices

**Decision:** Use X25519, AES-GCM-256, PBKDF2 with standard parameters.

**Reasoning:**

- **Following best practices**: These algorithms are well-documented and recommended
- **Native browser support**: All available via WebCrypto API
- **Learning focus**: Emphasis on understanding concepts over cryptographic research

### 3. No Perfect Forward Secrecy

**Decision:** Use static key pairs for the lifetime of the account.

**Reasoning:**

- **Faster development**: Simplifies key management significantly
- **Practice focus**: Project demonstrates core E2EE, not advanced protocols
- **Scope management**: One-on-one chat with basic E2EE is sufficient for learning goals

**What's missing:**

- No Double Ratchet algorithm
- No ephemeral keys per message/session
- Compromised private key = all past messages decryptable

### 4. Email-Based User Discovery

**Decision:** Find conversation partners by email address.

**Reasoning:**

- **Familiar UX pattern**: Users understand email-based lookup
- **Leverages Supabase auth**: Email already required for authentication
- **Simplicity**: No need for username systems or user IDs

**Trade-offs:**

- No username/display name separate from email

### 5. Monorepo with Three Packages

**Decision:** Split code into separate packages rather than monolithic app.

**Reasoning:**

- **Separation of concerns**: Clear boundaries between crypto, backend, and UI
- **Reusability**: Encryption package could be used in other projects
- **Learning opportunity**: Practice with npm workspaces and monorepo patterns
- **Code organization**: Easier to reason about dependencies

### 6. Practice Project Scope

**Decision:** Build functional E2EE messaging, not production-ready security.

**Reasoning:**

- **Primary goal**: Learn and demonstrate E2EE concepts
- **Target user**: Front-end developer practicing full-stack web development
- **Time constraints**: Balance between features and security perfection

**Known limitations:**

- Simplified key management (no rotation, no forward secrecy)
- No key verification mechanisms (susceptible to MitM if server compromised)
- No group chat support
- No typing indicators or read receipts
- No file/image encryption

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Supabase account and project

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up Supabase configuration:
   - Create a `.env` file in `pigeon-front-react/`
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. Run database migrations:

   ```bash
   # Apply migrations from supabase/migrations/
   npx supabase db push
   ```

4. Build the project:

   ```bash
   npm run build
   ```

5. Start the server:

   ```bash
   npm run preview
   ```
