import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  Button,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import RealFileEpubReader from "../components/EnhancedRealFileEpubReader";
// import ScreenshotProtection from "../components/ScreenshotProtection";
import BookListSection from "../components/BookListSection";
import AudioListSection from "../components/AudioListSection";
import AudioPlayerModal from "../components/AudioPlayerModal";
import { fetchIndividualAudio, requestAudioLicense } from "../services/audios";
import { generateRsaKeyPair } from "../utils/rsaEncrypt";
import { decryptAES256GCM } from "../utils/decrypt";
import RNFS from "react-native-fs";
import { decryptConcatenatedAES256GCM } from "../utils/decryptText";
import { ENCRYPTION_KEY } from "@env";

export default function HomeScreen({ navigation }) {
  const isDarkMode = useColorScheme() === "dark";
  const [currentMode, setCurrentMode] = useState("menu");
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [audioModalVisible, setAudioModalVisible] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? 'black' : 'white',
    flex: 1,
  };

  const handleAudioPress = async (audio) => {
    setAudioLoading(true);
    try {
      const licenseRes = await requestAudioLicense(audio.id);
      const individualAudioResponse = await fetchIndividualAudio(audio.id);
      const keyFromLicense = licenseRes?.payload?.decryptionKey;
      const decryptedKey = await decryptConcatenatedAES256GCM(keyFromLicense, ENCRYPTION_KEY);
      
      const decryptedBase64Audio = await decryptAES256GCM(
        individualAudioResponse.data,
        decryptedKey,
      );

      const filePath = `${
        RNFS.CachesDirectoryPath
      }/decrypted_${Date.now()}.mp3`;
      await RNFS.writeFile(filePath, decryptedBase64Audio, 'base64');

      const audioUrl =
        Platform.OS === 'android' ? filePath : `file://${filePath}`;

      const completeAudioData = {
        ...audio,
        audioUrl,
      };

      setSelectedAudio(completeAudioData);
      setAudioModalVisible(true);
    } catch (err) {
      console.error('Error fetching individual audio:', err.message);
      Alert.alert('Error', `Failed to load audio: ${err.message}`);
    } finally {
      setAudioLoading(false);
    }
  };

  const closeAudioModal = () => {
    setAudioModalVisible(false);
    setSelectedAudio(null);
  };

  if (currentMode === "reader") {
    return <RealFileEpubReader onBack={() => setCurrentMode("menu")} />;
  }

  return (
      <SafeAreaView style={[styles.container, backgroundStyle]}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={{flex : 1, flexDirection:'row', gap:10}}>
              <Image source={require('../assets/Logo.png')} style={{width:40, height:40, backgroundColor:'black', borderRadius:10 }}/>
            <Text style={styles.title}>Digital Library</Text>
            </View>
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

        {audioLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4B0082" />
              <Text style={styles.loadingText}>Loading ...</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
});
