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
import { fetchAllAudios } from "../services/audios";

export default function AudioListSection({ navigation, maxItems = 5, onAudioPress }) {
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAudios();
  }, []);

  const loadAudios = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAudios();
      setAudios(data.slice(0, maxItems)); // Show only first few items
    } catch (err) {
      console.error("Error fetching audios:", err.message);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioPress = (audio) => {
    onAudioPress(audio);
  };

  const handleSeeAll = () => {
    navigation.navigate("AllAudios");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.audioItem} onPress={() => handleAudioPress(item)}>
      <View style={styles.audioImageContainer}>
        <Image source={{ uri: item.cover }} style={styles.audioImage} />
        <View style={styles.playIcon}>
          <Text style={styles.playIconText}>▶</Text>
        </View>
      </View>
      <View style={styles.audioInfo}>
        <Text style={styles.audioName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.authorName} numberOfLines={1}>by {item.authorName}</Text>
        <Text style={styles.duration}>{item.duration || "Unknown"}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B0082" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>🎵 Audio Books</Text>
        <TouchableOpacity onPress={handleSeeAll} style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={audios}
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
    color: "#4B0082",
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
  audioItem: {
    width: 120,
    marginRight: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 8,
  },
  audioImageContainer: {
    position: "relative",
    marginBottom: 8,
  },
  audioImage: {
    width: 104,
    height: 140,
    borderRadius: 6,
  },
  playIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(75, 0, 130, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  playIconText: {
    color: "white",
    fontSize: 12,
    marginLeft: 2,
  },
  audioInfo: {
    flex: 1,
  },
  audioName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 2,
  },
  authorName: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 2,
  },
  duration: {
    fontSize: 9,
    color: "#9ca3af",
  },
});
