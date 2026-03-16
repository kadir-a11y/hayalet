import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("TOKEN_ENCRYPTION_KEY environment variable is not set");
  }
  const buf = Buffer.from(key, "hex");
  if (buf.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters)");
  }
  return buf;
}

/**
 * Encrypt a plain text token using AES-256-GCM.
 * Returns hex string: IV (12 bytes) + Auth Tag (16 bytes) + Ciphertext
 */
export function encryptToken(plainText: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  // IV + Tag + Ciphertext
  return Buffer.concat([iv, tag, encrypted]).toString("hex");
}

/**
 * Decrypt a hex-encoded token that was encrypted with encryptToken().
 */
export function decryptToken(encryptedHex: string): string {
  const key = getEncryptionKey();
  const data = Buffer.from(encryptedHex, "hex");

  if (data.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error("Invalid encrypted token: too short");
  }

  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * Check if TOKEN_ENCRYPTION_KEY is configured.
 */
export function isEncryptionConfigured(): boolean {
  try {
    getEncryptionKey();
    return true;
  } catch {
    return false;
  }
}
