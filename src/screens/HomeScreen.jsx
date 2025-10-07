import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  Button,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import RealFileEpubReader from "../components/EnhancedRealFileEpubReader";
import ScreenshotProtection from "../components/ScreenshotProtection";
import BookListSection from "../components/BookListSection";
import AudioListSection from "../components/AudioListSection";
import AudioPlayerModal from "../components/AudioPlayerModal";

export default function HomeScreen({ navigation }) {
  const isDarkMode = useColorScheme() === "dark";
  const [currentMode, setCurrentMode] = useState("menu");
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [audioModalVisible, setAudioModalVisible] = useState(false);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? 'black' : 'white',
    flex: 1,
  };

  const handleAudioPress = (audio) => {
    setSelectedAudio(audio);
    setAudioModalVisible(true);
  };

  const closeAudioModal = () => {
    setAudioModalVisible(false);
    setSelectedAudio(null);
  };

  if (currentMode === "reader") {
    return <RealFileEpubReader onBack={() => setCurrentMode("menu")} />;
  }

  return (
    <ScreenshotProtection>
      <SafeAreaView style={[styles.container, backgroundStyle]}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>📚 Digital Library</Text>
            <Text style={styles.subtitle}>Discover books and audiobooks</Text>
          </View>

          <BookListSection navigation={navigation} maxItems={5} />
          <AudioListSection 
            navigation={navigation} 
            maxItems={5} 
            onAudioPress={handleAudioPress}
          />
        </ScrollView>

        <AudioPlayerModal
          visible={audioModalVisible}
          audio={selectedAudio}
          onClose={closeAudioModal}
        />
      </SafeAreaView>
    </ScreenshotProtection>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  subtitle: { 
    fontSize: 16, 
    color: "#7f8c8d", 
    textAlign: "center" 
  },
});
