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
import { parseEpubContent  } from "../utils/epubParser";
import { base64ToBytes } from "../utils/decrypt.js";
import { fetchIndividualBook, requestBookLicense } from "../services/books";
import { WATERMARK_PRESETS } from "../utils/WatermarkUtils";
import Watermark from "../components/Watermark";
import { API_BASE_URL } from "@env";
import { log } from "console";
import { useNavigation } from "@react-navigation/native";


const screenWidth = Dimensions.get("window").width;
const imageWidth = screenWidth * 0.9;
const imageHeight = imageWidth * 0.5;

export default function BookDetails({ route }) {
  const { book } = route.params;
  const [loading, setLoading] = useState(false);
  const [parsedBookContent, setParsedBookContent] = useState(null); 
  const navigation = useNavigation();

    const handleReadBook =  () => {
        navigation.navigate("BookReader", { book });
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
            <Text style={styles.summaryTitle}>Book Name : <Text style={styles.bookName}>{book.name}</Text></Text>

            <Text style={styles.summaryTitle}>Author Name : <Text style={styles.authorName}>{book.authorName}</Text>
            </Text>
            <Text style={styles.summaryTitle}>Summary</Text>
            <Text style={styles.summaryText}>{book.summary || "No summary available."}</Text>

            <TouchableOpacity style={styles.readButton} onPress={handleReadBook}>
                <Text style={styles.readButtonText}>Read Book</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        alignItems: "center",
        backgroundColor: "#fff",
    },
    bookImage: {
        borderRadius: 8,
        marginBottom: 16,
    },
    bookName: {
        fontSize: 16,
        color: "#555",
        marginBottom: 4,
        alignSelf: "flex-start",

    },
    authorName: {
        fontSize: 16,
        color: "#555",
        marginBottom: 16,
        alignSelf: "flex-start",
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: "bold",
        alignSelf: "flex-start",
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 14,
        color: "#333",
        marginBottom: 24,
        textAlign: "justify",
    },
    readButton: {
        backgroundColor: "#4B0082",
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    readButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
