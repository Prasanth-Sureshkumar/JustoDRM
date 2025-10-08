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
  SafeAreaView,
} from "react-native";
import { fetchAllBooks } from "../services/books";
import { useNavigation } from "@react-navigation/native";
import { BookCardShimmer } from "../components/ShimmerLoader";

export default function AllBooksScreen() {
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
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => handleBookPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.bookImageContainer}>
        <Image 
          source={{ uri: item.cover }} 
          style={styles.bookImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.authorName} numberOfLines={1}>{item.authorName}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderShimmer = () => (
    <View style={styles.shimmerRow}>
      <BookCardShimmer />
      <BookCardShimmer />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.listContainer}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index}>
              {renderShimmer()}
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContainer: {
    padding: 12,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  shimmerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bookCard: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: "#0d182bc7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    padding: 12,
    maxWidth: '46%',
  },
  bookImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
  },
  bookInfo: {
    alignItems: 'center',
  },
  bookName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
    lineHeight: 18,
  },
  authorName: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
});
