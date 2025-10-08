import React, { useEffect, useState, useRef } from 'react';
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
  Animated,
  Easing,
} from 'react-native';
import {
  fetchAllAudios,
  fetchIndividualAudio,
  requestAudioLicense,
} from '../services/audios';
import { generateRsaKeyPair } from '../utils/rsaEncrypt';
import AudioPlayerModal from '../components/AudioPlayerModal';
import { decryptAES256GCM } from '../utils/decrypt';
import RNFS from 'react-native-fs';
import { decryptConcatenatedAES256GCM } from '../utils/decryptText';
import { ENCRYPTION_KEY } from '@env';

export default function AllAudiosScreen() {
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAudios();
    startLoadingAnimations();
  }, []);

  const startLoadingAnimations = () => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Continuous rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Staggered wave animations
    const createWaveAnimation = (animValue, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    createWaveAnimation(waveAnim1, 0).start();
    createWaveAnimation(waveAnim2, 200).start();
    createWaveAnimation(waveAnim3, 400).start();
  };

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
    setLoading(true);
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
      setLoading(false);
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

  if (loading) {
    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const waveScale1 = waveAnim1.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1.2],
    });

    const waveScale2 = waveAnim2.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 1.1],
    });

    const waveScale3 = waveAnim3.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 1.0],
    });

    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Animated.View 
          style={[
            styles.loadingContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Main Circle Container */}
          <View style={styles.circleContainer}>
            {/* Animated Background Circles */}
            <View style={styles.backgroundCircles}>
              <Animated.View 
                style={[
                  styles.circle,
                  styles.circle1,
                  { transform: [{ scale: waveScale1 }] },
                ]} 
              />
              <Animated.View 
                style={[
                  styles.circle,
                  styles.circle2,
                  { transform: [{ scale: waveScale2 }] },
                ]} 
              />
              <Animated.View 
                style={[
                  styles.circle,
                  styles.circle3,
                  { transform: [{ scale: waveScale3 }] },
                ]} 
              />
            </View>

            {/* Audio Wave Inside Circle */}
            <View style={styles.audioWaveContainer}>
              <Animated.View 
                style={[
                  styles.waveBar,
                  { transform: [{ scaleY: waveAnim1 }] },
                ]} 
              />
              <Animated.View 
                style={[
                  styles.waveBar,
                  { transform: [{ scaleY: waveAnim2 }] },
                ]} 
              />
              <Animated.View 
                style={[
                  styles.waveBar,
                  { transform: [{ scaleY: waveAnim3 }] },
                ]} 
              />
              <Animated.View 
                style={[
                  styles.waveBar,
                  { transform: [{ scaleY: waveAnim1 }] },
                ]} 
              />
              <Animated.View 
                style={[
                  styles.waveBar,
                  { transform: [{ scaleY: waveAnim2 }] },
                ]} 
              />
            </View>
          </View>

          {/* Text Below Circle */}
          <View style={styles.textContainer}>
            <Animated.Text 
              style={[
                styles.loadingText,
                { opacity: pulseAnim },
              ]}
            >
              Loading audio books...
            </Animated.Text>
            
            <Text style={styles.loadingSubtext}>
              🎵 Preparing your audio experience
            </Text>
          </View>
        </Animated.View>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  circleContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 40,
  },
  backgroundCircles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: '#6366f1',
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: '#8b5cf6',
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: '#06b6d4',
  },
  spinnerContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  customSpinner: {
    width: 60,
    height: 60,
    position: 'relative',
  },
  spinnerDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0d182bc7',
  },
  dot1: {
    top: 0,
    left: 24,
  },
  dot2: {
    top: 24,
    right: 0,
  },
  dot3: {
    bottom: 0,
    left: 24,
  },
  dot4: {
    top: 24,
    left: 0,
  },
  audioWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    position: 'absolute',
    top: '50%',
    left: '53%',
    transform: [{ translateX: -25 }, { translateY: -10 }],
  },
  waveBar: {
    width: 4,
    height: 20,
    backgroundColor: '#6366f1',
    borderRadius: 2,
    opacity: 0.7,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '400',
    textAlign: 'center',
    opacity: 0.8,
  },
});
