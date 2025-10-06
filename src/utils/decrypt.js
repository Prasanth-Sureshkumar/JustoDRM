import CryptoJS from "crypto-js";
import { Buffer } from "buffer";

export const hexToWordArray = (hexStr) => {
  return CryptoJS.enc.Hex.parse(hexStr);
};

export function decryptAES256GCM(jsonStr, hexKey) {
  const encJson = JSON.parse(jsonStr);
  if (!encJson.iv || !encJson.authTag || !encJson.content)
    throw new Error("Missing iv/authTag/content in JSON");

  const key = base64ToUint8Array(hexKey);
  const iv = base64ToUint8Array(encJson.iv);
  const ciphertext = base64ToUint8Array(encJson.content);
  const authTag = base64ToUint8Array(encJson.authTag);

  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext },
    key,
    { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
  );

  const base64Str = CryptoJS.enc.Base64.stringify(decrypted);
  return base64Str;
}

export function base64ToUint8Array(base64) {
  const buffer = Buffer.from(base64, "base64");
  return new Uint8Array(buffer);
}
