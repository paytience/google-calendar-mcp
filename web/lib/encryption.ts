const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes as Uint8Array<ArrayBuffer>;
}

export async function encryptTokens(plaintext: string): Promise<{
  encrypted: string;
  iv: string;
  tag: string;
}> {
  const { webcrypto } = await import("node:crypto");
  const keyBytes = hexToBytes(ENCRYPTION_KEY);
  const key = await webcrypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt"]);
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertextWithTag = new Uint8Array(
    await webcrypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded)
  );
  const ciphertext = ciphertextWithTag.slice(0, ciphertextWithTag.length - 16);
  const tag = ciphertextWithTag.slice(ciphertextWithTag.length - 16);
  return {
    encrypted: Buffer.from(ciphertext).toString("base64"),
    iv: Buffer.from(iv).toString("base64"),
    tag: Buffer.from(tag).toString("base64"),
  };
}
