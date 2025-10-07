import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { decryptAES256GCM } from "../utils/decrypt";
import { generateRsaKeyPair } from "../utils/rsaEncrypt";
import { fetchIndividualBook, requestBookLicense } from "../services/books";
import { saveDecryptedEpub } from "../utils/saveFilesLocally";
import { API_BASE_URL } from "@env";
import WebViewEpubReader from "./EpubReader";



export default function BookReader({ route }) {
  const { book } = route.params;
  const [loading, setLoading] = useState(true);
  const [base64Epub, setBase64Epub] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const rsaKeys = await generateRsaKeyPair();
        const licenseRes = await requestBookLicense(book.id, rsaKeys.public);
        const base64Key = licenseRes?.payload?.decryptionKey;
        if (!base64Key) throw new Error("Failed to acquire AES key");

        const res = await fetchIndividualBook(`${API_BASE_URL}${book.bookUrl}`);
        const encJson = res.data;

        const decryptedBase64 = await decryptAES256GCM(encJson, base64Key);
        // const epubPath = await saveDecryptedEpub(decryptedBase64, book.id);
        // setBase64Epub(decryptedBase64); 
        // console.log("Decrypted EPUB saved at:", epubPath);
        


        if (!decryptedBase64) throw new Error("AES Decryption failed");

        setBase64Epub(decryptedBase64);
      } catch (err) {
        console.error("❌ Decryption failed:", err);
        Alert.alert("Error", err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [book]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4B0082" />
        <Text style={{ marginTop: 8 }}>Decrypting and loading book...</Text>
      </View>
    );
  }

  if (!base64Epub) {
    return (
      <View style={styles.loader}>
        <Text>Failed to load book.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebViewEpubReader base64Epub={base64Epub}/>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
    container: {
    flex: 1,
  },
  epub: {
    flex: 1,
  },
});
