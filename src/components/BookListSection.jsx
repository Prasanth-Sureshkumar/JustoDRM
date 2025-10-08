import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { fetchAllBooks } from "../services/books";
import { ShimmerLoader } from "./ShimmerLoader";

export default function BookListSection({ navigation, maxItems = 5 }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await fetchAllBooks();
      setBooks(data.slice(0, maxItems)); // Show only first few items
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

  const handleSeeAll = () => {
    navigation.navigate("AllBooks");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.bookItem} onPress={() => handleBookPress(item)}>
      <Image source={{ uri: item.cover }} style={styles.bookImage} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.authorName} numberOfLines={1}>by {item.authorName}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderShimmerItem = () => (
    <View style={styles.shimmerItem}>
      <ShimmerLoader 
        width={104} 
        height={140} 
        borderRadius={6} 
        style={styles.shimmerImage}
      />
      <ShimmerLoader 
        width="85%" 
        height={12} 
        borderRadius={4}
        style={styles.shimmerTitle}
      />
      <ShimmerLoader 
        width="70%" 
        height={10} 
        borderRadius={4}
        style={styles.shimmerAuthor}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>📚 Books</Text>
          <TouchableOpacity style={styles.seeAllButton} disabled>
            <Text style={[styles.seeAllText, { opacity: 0.5 }]}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.shimmerContainer}>
          {Array.from({ length: maxItems }).map((_, index) => (
            <View key={index}>
              {renderShimmerItem()}
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>📚 Books</Text>
        <TouchableOpacity onPress={handleSeeAll} style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  seeAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: "#010f29",
    fontWeight: "600",
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  bookItem: {
    width: 120,
    marginRight: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 8,
  },
  bookImage: {
    width: 104,
    height: 140,
    borderRadius: 6,
    marginBottom: 8,
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  authorName: {
    fontSize: 10,
    color: "#6b7280",
  },
  shimmerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  shimmerItem: {
    width: 120,
    marginRight: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 8,
  },
  shimmerImage: {
    marginBottom: 8,
  },
  shimmerTitle: {
    marginBottom: 6,
  },
  shimmerAuthor: {
    marginBottom: 4,
  },
});
