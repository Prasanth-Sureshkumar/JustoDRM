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
import { fetchAllAudios } from "../services/audios";
import AudioPlayerModal from "../components/AudioPlayerModal";

export default function AllAudiosScreen() {
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadAudios();
  }, []);

  const loadAudios = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAudios();
      setAudios(data);
    } catch (err) {
      console.error("Error fetching audios:", err.message);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioPress = (audio) => {
    setSelectedAudio(audio);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAudio(null);
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
        <Text style={styles.audioName}>{item.name}</Text>
        <Text style={styles.authorName}>by {item.authorName}</Text>
        <Text style={styles.duration}>{item.duration || "Unknown duration"}</Text>
        <Text style={styles.audioDescription} numberOfLines={2}>
          {item.description || "No description available"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#4B0082" />
        <Text style={styles.loadingText}>Loading audio books...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={audios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      <AudioPlayerModal
        visible={modalVisible}
        audio={selectedAudio}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    padding: 16,
  },
  audioItem: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  audioImageContainer: {
    position: "relative",
    marginRight: 12,
  },
  audioImage: {
    width: 60,
    height: 90,
    borderRadius: 4,
  },
  playIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -12 }, { translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(75, 0, 130, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  playIconText: {
    color: "white",
    fontSize: 10,
    marginLeft: 1,
  },
  audioInfo: {
    flex: 1,
  },
  audioName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  authorName: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  duration: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
  },
  audioDescription: {
    fontSize: 12,
    color: "#9ca3af",
    lineHeight: 16,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6b7280",
  },
});
