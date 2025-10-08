import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { fetchAllAudios } from "../services/audios";
import { ShimmerLoader } from "./ShimmerLoader";

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
      setAudios(data.slice(0, maxItems));
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
        {/* <Text style={styles.duration}>{item.duration || "Unknown"}</Text> */}
      </View>
    </TouchableOpacity>
  );

  const renderShimmerItem = () => (
    <View style={styles.shimmerItem}>
      <View style={styles.shimmerImageContainer}>
        <ShimmerLoader 
          width={104} 
          height={140} 
          borderRadius={6} 
          style={styles.shimmerImage}
        />
      </View>
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
          <Text style={styles.sectionTitle}>🎵 Audio Books</Text>
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
    color: "#010f29",
    fontWeight: "600",
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
    backgroundColor: "#0d182bc7",
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
  shimmerImageContainer: {
    position: "relative",
    marginBottom: 8,
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
