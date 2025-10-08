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
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Now Playing</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.albumArtContainer}>
            <View style={styles.albumArtShadow}>
              <Image source={{ uri: audio.cover }} style={styles.albumArt} />
              <View style={styles.albumArtOverlay}>
                <View style={styles.glowEffect} />
              </View>
            </View>
            <View style={styles.audioWaveform}>
              <View style={[styles.waveBar, { height: 12 }]} />
              <View style={[styles.waveBar, styles.waveBarActive, { height: 20 }]} />
              <View style={[styles.waveBar, { height: 8 }]} />
              <View style={[styles.waveBar, styles.waveBarActive, { height: 16 }]} />
              <View style={[styles.waveBar, { height: 10 }]} />
              <View style={[styles.waveBar, styles.waveBarActive, { height: 18 }]} />
              <View style={[styles.waveBar, { height: 6 }]} />
            </View>
          </View>

          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle} numberOfLines={2}>
              {audio.name}
            </Text>
            <Text style={styles.artistName}>by {audio.authorName}</Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressContainer}>
              <Slider
                style={styles.progressSlider}
                value={currentTime}
                minimumValue={0}
                maximumValue={duration}
                minimumTrackTintColor="#f6f6faff"
                maximumTrackTintColor="#fffefeff"
                thumbStyle={styles.sliderThumb}
                trackStyle={styles.sliderTrack}
                onSlidingComplete={seekToTime}
              />
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                <View style={styles.progressDot} />
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.controlsContainer}>
            <View style={styles.controlsBackground}>
              <TouchableOpacity
                style={[styles.playPauseButton, isPlaying && styles.playPauseButtonActive]}
                onPress={togglePlayPause}
              >
                <View style={styles.playButtonInner}>
                  <Text style={styles.playPauseIcon}>
                    {isPlaying ? '⏸' : '▶'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.67)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: '90%',
    backgroundColor: 'rgba(38, 46, 58, 0.95)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.3)',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    paddingBottom: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#404040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#E5E5E5',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F5F5',
    letterSpacing: 0.5,
  },
  placeholder: { width: 28 },
  albumArtContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  albumArtShadow: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    borderRadius: 10,
    marginBottom: 10,
    position: 'relative',
  },
  albumArt: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#404040',
  },
  albumArtOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 18,
    opacity: 0.8,
  },
  audioWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginTop: 6,
  },
  waveBar: {
    width: 2.5,
    backgroundColor: '#555555',
    borderRadius: 1.25,
  },
  waveBarActive: {
    backgroundColor: '#6366F1',
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    paddingBottom: 12,
    width: '100%',
  },
  trackTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F5F5F5',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 22,
  },
  artistName: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    fontWeight: '500',
  },
  progressSection: {
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  progressContainer: {
    width: '100%',
  },
  progressSlider: {
    width: '100%',
    height: 40,
    marginVertical: 6,
  },
  sliderThumb: {
    backgroundColor: '#6366F1',
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 10,
  },
  timeText: {
    fontSize: 13,
    color: '#B0B0B0',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  progressDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#555555',
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  controlsBackground: {
    padding: 6,
    borderRadius: 32,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#404040',
  },
  playPauseButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    transform: [{ scale: 1 }],
  },
  playPauseButtonActive: {
    backgroundColor: '#4F46E5',
    transform: [{ scale: 0.96 }],
  },
  playButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 2,
  },
});
