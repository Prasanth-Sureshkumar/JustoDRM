import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { decryptAES256GCM } from "../utils/decrypt";
import { generateRsaKeyPair } from "../utils/rsaEncrypt";
import { fetchIndividualBook, requestBookLicense } from "../services/books";
import { saveDecryptedEpub } from "../utils/saveFilesLocally";
import { API_BASE_URL } from "@env";
import EpubWebView from "./EpubReader";


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
        setBase64Epub(decryptedBase64); 
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

// const htmlContent = (fileUri) => `
//     <!DOCTYPE html>
//     <html>
//     <head>
//     <meta charset="utf-8">
//     <script src="https://unpkg.com/epubjs/dist/epub.min.js"></script>
//     <style>
//         html, body { margin:0; padding:0; height:100%; }
//         #viewer { width:100%; height:100%; }
//     </style>
//     </head>
//     <body>
//     <div id="viewer"></div>
//     <script>
//         const fileUrl = "file://${fileUri}";
//         const book = ePub(fileUrl);
//         const rendition = book.renderTo("viewer", { width:"100%", height:"100%" });
//         rendition.display();
//     </script>
//     </body>
//     </html>
//     `;


  return (
    <View style={{ flex: 1, padding:10, backgroundColor:'pink' }}>
     <EpubWebView base64Epub={base64Epub} />
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
});
