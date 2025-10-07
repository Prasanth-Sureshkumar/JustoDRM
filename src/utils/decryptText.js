import { decode as atob } from 'base-64';
import { subtle } from 'react-native-quick-crypto';
import { TextDecoder } from 'text-encoding';


/**
 * Decrypt AES-256-GCM payload (format: iv(16) + authTag(16) + ciphertext)
 * @param {string} encryptedBase64 - encrypted string (Base64)
 * @param {string} base64Key - 32-byte AES key, Base64-encoded
 * @returns {Promise<string>} decrypted UTF-8 string
 */
export async function decryptConcatenatedAES256GCM(encryptedBase64, base64Key) {
  try {
    const payload = base64ToBytes(encryptedBase64);
    const keyBytes = base64ToBytes(base64Key);

    if (keyBytes.length !== 32) {
      throw new Error(`Invalid AES key length ${keyBytes.length}, expected 32 bytes`);
    }
    if (payload.length < 32) {
      throw new Error('Payload too short: must include iv(16)+authTag(16)+ciphertext');
    }

    const iv = payload.slice(0, 16);
    const authTag = payload.slice(16, 32);
    const ciphertext = payload.slice(32);

    const combinedBuffer = concatBuffers(ciphertext.buffer, authTag.buffer);

    const cryptoKey = await subtle.importKey(
      'raw',
      keyBytes.buffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decryptedBuffer = await subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv.buffer,
        tagLength: authTag.length * 8,
      },
      cryptoKey,
      combinedBuffer
    );
    const u8 = new Uint8Array(decryptedBuffer);
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < u8.length; i += chunkSize) {
      const chunk = u8.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }
    console.log(binary, "this is inside single");
    return btoa(binary);

  } catch (err) {
    console.error('Decryption failed:', err.message || err);
    throw err;
  }
}

/* utilities */
function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function concatBuffers(buf1, buf2) {
  const a = new Uint8Array(buf1.byteLength + buf2.byteLength);
  a.set(new Uint8Array(buf1), 0);
  a.set(new Uint8Array(buf2), buf1.byteLength);
  return a.buffer;
}
