import { RSA } from 'react-native-rsa-native';

/**
 * Generate an RSA key pair.
 * @param {number} keySize The desired key size (e.g., 2048 or 4096).
 * @returns {Promise<{private: string, public: string}>} A promise that resolves to an object containing the private and public keys in PEM format.
 */
export async function generateRsaKeyPair(keySize = 2048) {
    try {
        const keys = await RSA.generateKeys(keySize);
        // The keys are returned in standard PEM format.
        return keys;
    } catch (error) {
        console.error("Error generating RSA keys:", error);
        throw error;
    }
}

/**
 * Decrypt data using the RSA private key.
 * @param {string} encryptedBase64 The encrypted data (Base64 encoded string).
 * @param {string} privateKey The RSA private key in PEM format.
 * @returns {Promise<string>} A promise that resolves to the decrypted plaintext data.
 */
export async function decryptWithPrivateKey(encryptedBase64, privateKey) {
    // Note: The `passphrase` is for key decryption (if the key file itself is encrypted), 
    // which is not a standard parameter for the main `decrypt` function in this library.
    console.log(encryptedBase64, privateKey);
    
    try {
        const decrypted = await RSA.decrypt(encryptedBase64, privateKey);
        // react-native-rsa-native returns the plaintext string directly
        return decrypted;
    } catch (error) {
        console.error("Error decrypting with private key:", error);
        throw error;
    }
}
