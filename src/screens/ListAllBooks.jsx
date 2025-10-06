import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { fetchAllBooks } from "../services/books";
import { useNavigation } from "@react-navigation/native";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await fetchAllBooks();
      setBooks(data);
    } catch (err) {
      console.error("Error fetching books:", err.message);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookPress = (book) => {
    navigation.navigate("BookDetails", { book });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.bookItem} onPress={() => handleBookPress(item)}>
      <Image source={{ uri: item.cover }} style={styles.bookImage} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookName}>{item.name}</Text>
        <Text style={styles.authorName}>by {item.authorName}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#4B0082" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  bookItem: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#dedee2ff",
    marginBottom: 12,
    alignItems: "center",
  },
  bookImage: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: 12,
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  authorName: {
    fontSize: 14,
    color: "#1f2937",
    marginTop: 4,
  },
});
