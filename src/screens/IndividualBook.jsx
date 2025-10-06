import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const imageWidth = screenWidth * 0.9;
const imageHeight = imageWidth * 0.5;

export default function BookDetails({ route }) {
    const { book } = route.params;

    const handleReadBook = () => {
        Alert.alert("Read Book", `Opening ${book.name}...`);
    };

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
