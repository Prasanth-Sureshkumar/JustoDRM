import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import {
  fetchAllAudios,
  fetchIndividualAudio,
  requestAudioLicense,
} from '../services/audios';
import AudioPlayerModal from '../components/AudioPlayerModal';
import { decryptAES256GCM } from '../utils/decrypt';
import RNFS from 'react-native-fs';
import { decryptConcatenatedAES256GCM } from '../utils/decryptText';
import { ENCRYPTION_KEY } from '@env';
import { BookCardShimmer } from '../components/ShimmerLoader';
import AnimatedLoadingComponent from '../components/AnimatedLoadingComponent';

export default function AllAudiosScreen() {
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
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
      console.error('Error fetching audios:', err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioPress = async audio => {
    setLoadingAudio(true);
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
      setModalVisible(true);
    } catch (err) {
      console.error('Error fetching individual audio:', err.message);
      Alert.alert('Error', `Failed to load audio: ${err.message}`);
    } finally {
      setLoadingAudio(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAudio(null);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.audioCard}
      onPress={() => handleAudioPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.audioImageContainer}>
        <Image 
          source={{ uri: item.cover }} 
          style={styles.audioImage}
          resizeMode="cover"
        />
        <View style={styles.playIconOverlay}>
          <View style={styles.playIcon}>
            <Text style={styles.playIconText}>▶</Text>
          </View>
        </View>
      </View>
      <View style={styles.audioInfo}>
        <Text style={styles.audioName} numberOfLines={2}>{item.name}</Text>
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
        data={audios}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
      />
      <AnimatedLoadingComponent
        visible={loadingAudio}
        loadingText="Loading audio..."
        subText="🎵 Preparing your audio experience"
        backgroundColor="rgba(255, 255, 255, 1)"
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
  audioCard: {
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
  audioImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 10,
  },
  audioImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
  },
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0d182bc7",
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#0d182bc7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  playIconText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 2,
    fontWeight: 'bold',
  },
  audioInfo: {
    alignItems: 'center',
  },
  audioName: {
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
});
