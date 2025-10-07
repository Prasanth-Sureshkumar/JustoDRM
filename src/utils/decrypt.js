// import { decode as atob } from "base-64";
// import { subtle } from 'react-native-quick-crypto';

// function base64ToBytes(base64) {
//   const binary = atob(base64);
//   const bytes = new Uint8Array(binary.length);
//   for (let i = 0; i < binary.length; i++) {
//     bytes[i] = binary.charCodeAt(i);
//   }
//   return bytes;
// }

// /**
//  * Decrypt AES-256-GCM JSON
//  * @param {object} encJson { iv, authTag, content }
//  * @param {string} base64Key AES key (base64)
//  * @returns {string} UTF-8 decrypted string
//  */
// export async function decryptAES256GCM(encJson, base64Key) {
//   if (!encJson.iv || !encJson.authTag || !encJson.content)
//     throw new Error("Missing iv/authTag/content in JSON");

//   const iv = base64ToBytes(encJson.iv);
//   const authTag = base64ToBytes(encJson.authTag);
//   const ciphertext = base64ToBytes(encJson.content);

// //   console.log("🔐 Starting AES Decryption", { iv, authTag });

//   const combined = new Uint8Array(ciphertext.length + authTag.length);
//   combined.set(ciphertext);
//   combined.set(authTag, ciphertext.length);

//   const keyBytes = base64ToBytes(base64Key);

//   const cryptoKey = await subtle.importKey(
//     "raw",
//     keyBytes,
//     { name: "AES-GCM" },
//     false,
//     ["decrypt"]
//   );

// //   console.log("what comes here",combined);

// //   console.log("🔑 AES Key imported", cryptoKey);

//   const decryptedBuffer = await subtle.decrypt(
//     { name: "AES-GCM", iv },
//     cryptoKey,
//     combined
//   );

//   console.log("✅ AES Decryption successful", decryptedBuffer);

//   return new TextDecoder().decode(decryptedBuffer);
// }

import { decode as atob } from 'base-64';
import { subtle } from 'react-native-quick-crypto';
import { TextDecoder } from 'text-encoding';

/* small helper: Base64 -> Uint8Array */
function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/* small helper: hex preview (first N bytes) */
function previewBytes(u8, n = 8) {
  if (!u8) return '';
  const len = Math.min(u8.length, n);
  let s = '';
  for (let i = 0; i < len; i++) s += u8[i].toString(16).padStart(2, '0');
  if (u8.length > n) s += '...';
  return s;
}

/* concat ArrayBuffers -> ArrayBuffer */
function concatBuffers(buf1, buf2) {
  const a = new Uint8Array(buf1.byteLength + buf2.byteLength);
  a.set(new Uint8Array(buf1), 0);
  a.set(new Uint8Array(buf2), buf1.byteLength);
  return a.buffer;
}

/**
 * Decrypt AES-256-GCM (react-native-quick-crypto)
 * @param {object} encJson { iv, authTag, content }  (all base64)
 * @param {string} base64Key  AES-256 key (base64)
 * @returns {Promise<string>} decrypted UTF-8 string
 */
export async function decryptAES256GCM(encJson, base64Key) {
  try {
    if (!encJson?.iv || !encJson?.authTag || !encJson?.content)
      throw new Error('Missing iv/authTag/content in JSON');

    // decode
    const iv = base64ToBytes(encJson.iv); // Uint8Array
    const authTag = base64ToBytes(encJson.authTag); // Uint8Array (usually 16)
    const ciphertext = base64ToBytes(encJson.content); // Uint8Array
    const keyBytes = base64ToBytes(base64Key); // Uint8Array (should be 32)

    if (keyBytes.length !== 32) {
      throw new Error(
        `Invalid key length ${keyBytes.length}, expected 32 bytes (AES-256)`,
      );
    }
    if (iv.length !== 12) {
      console.warn(
        `Warning: iv length is ${iv.length}, recommended 12 bytes for GCM`,
      );
    }
    if (authTag.length === 0) {
      throw new Error('Auth tag length is 0');
    }

    // Combine ciphertext + authTag if your implementation expects appended tag.
    // react-native-quick-crypto's subtle.decrypt will accept ciphertext+tag as single buffer,
    // but also needs tagLength in options.
    const combinedBuffer = concatBuffers(ciphertext.buffer, authTag.buffer);

    // importKey needs ArrayBuffer or TypedArray — pass ArrayBuffer for consistency
    const cryptoKey = await subtle.importKey(
      'raw',
      keyBytes.buffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt'],
    );

    // decrypt: pass iv, and set tagLength in bits (authTag.length * 8)
    const decryptedBuffer = await subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv.buffer,
        tagLength: authTag.length * 8,
      },
      cryptoKey,
      combinedBuffer,
    );

    // const decoder = new TextDecoder();
    // const decryptedText = decoder.decode(decryptedBuffer);

    // return decryptedText;
    const u8 = new Uint8Array(decryptedBuffer);
    let binary = '';
    const chunkSize = 0x8000; // 32k chunk to avoid stack overflow
    for (let i = 0; i < u8.length; i += chunkSize) {
      const chunk = u8.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }
    const base64 = btoa(binary);

    return base64;
  } catch (err) {
    console.error('Decryption failed:', err && err.message ? err.message : err);
    throw err;
  }
}
