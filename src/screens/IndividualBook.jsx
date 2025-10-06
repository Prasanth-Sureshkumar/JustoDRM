import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { decryptAES256GCM } from "../utils/decrypt";
import { generateRsaKeyPair, decryptWithPrivateKey } from "../utils/rsaEncrypt"; 
import { base64ToBytes, parseEpubContent  } from "../utils/epubParser";
import { requestBookLicense } from "../services/books";
import { WATERMARK_PRESETS } from "../utils/WatermarkUtils";
import Watermark from "../components/Watermark";


const screenWidth = Dimensions.get("window").width;
const imageWidth = screenWidth * 0.9;
const imageHeight = imageWidth * 0.5;

export default function BookDetails({ route }) {
  const { book } = route.params;
  const [loading, setLoading] = useState(false);
  const [parsedBookContent, setParsedBookContent] = useState(null); 

  const handleReadBook = async () => {
    try {
        setLoading(true);
        const { publicKey, privateKey } = await generateRsaKeyPair();         
        const licenseRes = await requestBookLicense(book.id, publicKey);
        if (!licenseRes?.data?.encryptedKey) {
          throw new Error("Failed to acquire license");
        }
        const hexKey = await decryptWithPrivateKey(licenseRes.data.decryptionKey, privateKey);
      const res = await fetch(book.bookUrl);
      if (!res.ok) throw new Error("Failed to fetch book");
      const encryptedJson = await res.text();
      const base64Data = decryptAES256GCM(encryptedJson, hexKey);
      if (!base64Data) throw new Error("AES Decryption failed: received empty data.");

              const epubBytes = base64ToBytes(base64Data);
        const epubArrayBuffer = epubBytes.buffer;

        // Parse the EPUB content using the custom utility
        const content = await parseEpubContent(epubArrayBuffer);
        
        setParsedBookContent(content); 

    } catch (err) {
      console.error("Decryption failed:", err.message);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

    if (parsedBookContent) {
    const { metadata, chapters } = parsedBookContent;
    return (
      <View style={styles.readerContainer}>
          <View style={styles.readerHeader}>
            <Text style={styles.bookTitle} numberOfLines={1}>{metadata.title}</Text>
            <Text style={styles.bookAuthor}>by {metadata.creator}</Text>
          </View>

          <View style={styles.contentWrapper}>
            <ScrollView style={styles.contentArea} contentContainerStyle={styles.contentContainer}>
                {chapters.map((chapter, index) => (
                    <View key={chapter.id} style={styles.chapterContainer}>
                        <Text style={styles.chapterTitle}>{chapter.title}</Text>
                        <Text style={styles.chapterText}>{chapter.content}</Text>
                        {index < chapters.length - 1 && (
                            <View style={styles.chapterDivider} />
                        )}
                    </View>
                ))}
            </ScrollView>
            <Watermark 
                text={WATERMARK_PRESETS.medium.text}
                opacity={WATERMARK_PRESETS.medium.opacity}
                fontSize={WATERMARK_PRESETS.medium.fontSize}
                color={WATERMARK_PRESETS.medium.color}
                rotation={WATERMARK_PRESETS.medium.rotation}
            />
          </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: book.cover }} style={[styles.bookImage, { width: imageWidth, height: imageHeight }]} />
      <Text style={styles.summaryTitle}>Book Name</Text>
      <Text style={styles.bookName}>{book.name}</Text>
      <Text style={styles.summaryTitle}>Author Name</Text>
      <Text style={styles.authorName}>{book.authorName}</Text>
      <Text style={styles.summaryTitle}>Summary</Text>
      <Text style={styles.summaryText}>{book.summary || "No summary available."}</Text>

      <TouchableOpacity style={styles.readButton} onPress={handleReadBook}>
        <Text style={styles.readButtonText}>Read Book</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#4B0082" style={{ marginTop: 16 }} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: "center", backgroundColor: "#fff" },
  bookImage: { borderRadius: 8, marginBottom: 16 },
  bookName: { fontSize: 20, fontWeight: "bold", marginBottom: 4, textAlign: "center" },
  authorName: { fontSize: 16, color: "#555", marginBottom: 16, textAlign: "center" },
  summaryTitle: { fontSize: 18, fontWeight: "bold", alignSelf: "center", marginBottom: 8 },
  summaryText: { fontSize: 14, color: "#333", marginBottom: 24, textAlign: "justify" },
  readButton: { backgroundColor: "#4B0082", paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8 },
  readButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
