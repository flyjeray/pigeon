/* eslint-disable @typescript-eslint/no-explicit-any */

import { webcrypto } from "crypto";

// Provide a WebCrypto-compatible `crypto` in the Node test environment
if (!(globalThis as any).crypto) {
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
    configurable: true,
  });
}

// Minimal `window` shim so library calls to `window.crypto` work
if (!(globalThis as any).window) {
  (globalThis as any).window = {};
}

if (!(globalThis as any).window.crypto) {
  (globalThis as any).window.crypto = webcrypto;
}
