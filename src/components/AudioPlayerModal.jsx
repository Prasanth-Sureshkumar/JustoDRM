import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import Sound from 'react-native-sound';

const { width } = Dimensions.get('window');

export default function AudioPlayerModal({ visible, audio, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const soundRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (visible && audio?.audioUrl) {
      initializeAudio(audio.audioUrl);
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.release();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    };
  }, [visible, audio]);

  const initializeAudio = audioUri => {
    if (!audioUri) return;

    Sound.setCategory('Playback');
    const path =
      Platform.OS === 'android' ? audioUri.replace('file://', '') : audioUri;

    soundRef.current = new Sound(path, '', error => {
      if (error) {
        console.error('Failed to load sound', error);
        Alert.alert('Error', 'Failed to load audio file');
        return;
      }
      setDuration(soundRef.current.getDuration());
    });
  };

  const startTimeTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (soundRef.current) {
        soundRef.current.getCurrentTime(seconds => {
          setCurrentTime(seconds);
        });
      }
    }, 1000);
  };

  const stopTimeTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const togglePlayPause = () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundRef.current.pause();
      stopTimeTracking();
      setIsPlaying(false);
    } else {
      soundRef.current.play(success => {
        if (!success) {
          console.log('Playback error');
          stopTimeTracking();
        }
        setIsPlaying(false);
        stopTimeTracking();
      });
      startTimeTracking();
      setIsPlaying(true);
    }
  };

  const seekToTime = time => {
    if (soundRef.current) {
      soundRef.current.setCurrentTime(time);
      setCurrentTime(time);
    }
  };

  // Clean up when modal closes
  useEffect(() => {
    if (!visible) {
      stopTimeTracking();
      if (soundRef.current) {
        soundRef.current.stop();
      }
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [visible]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (soundRef.current) {
      soundRef.current.setVolume(isMuted ? volume : 0);
    }
  };

  const adjustVolume = newVolume => {
    setVolume(newVolume);
    if (soundRef.current && !isMuted) {
      soundRef.current.setVolume(newVolume);
    }
  };

  const formatTime = time => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!audio) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Now Playing</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Album Art */}
          <View style={styles.albumArtContainer}>
            <Image source={{ uri: audio.cover }} style={styles.albumArt} />
          </View>

          {/* Track Info */}
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle}>{audio.name}</Text>
            <Text style={styles.artistName}>by {audio.authorName}</Text>
          </View>

          {/* Progress Slider */}
          <View style={styles.progressContainer}>
            <Slider
              style={styles.progressSlider}
              value={currentTime}
              minimumValue={0}
              maximumValue={duration}
              minimumTrackTintColor="#4B0082"
              maximumTrackTintColor="#e5e7eb"
              onSlidingComplete={seekToTime}
            />
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.playPauseButton}
              onPress={togglePlayPause}
            >
              <Text style={styles.playPauseIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
          </View>

          {/* Volume */}
          <View style={styles.volumeContainer}>
            <TouchableOpacity onPress={toggleMute} style={styles.muteButton}>
              <Text style={styles.muteIcon}>{isMuted ? '🔇' : '🔊'}</Text>
            </TouchableOpacity>
            <Slider
              style={styles.volumeSlider}
              value={isMuted ? 0 : volume}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor="#4B0082"
              maximumTrackTintColor="#e5e7eb"
              onValueChange={adjustVolume}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: { fontSize: 24, color: '#6b7280' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  placeholder: { width: 30 },
  albumArtContainer: { marginBottom: 20 },
  albumArt: { width: 200, height: 200, borderRadius: 15 },
  trackInfo: { alignItems: 'center', marginBottom: 30 },
  trackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 5,
  },
  artistName: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  progressContainer: { width: '100%', marginBottom: 30 },
  progressSlider: { width: '100%', height: 40 },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  timeText: { fontSize: 12, color: '#6b7280' },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  playPauseButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4B0082',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: { fontSize: 30, color: 'white' },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  muteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteIcon: { fontSize: 20 },
  volumeSlider: { flex: 1, height: 40 },
});
