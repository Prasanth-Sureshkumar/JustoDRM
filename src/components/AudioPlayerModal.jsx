import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import Slider from "@react-native-community/slider";
// import Sound from "react-native-sound"; // Uncomment when package is installed

const { width } = Dimensions.get("window");

export default function AudioPlayerModal({ visible, audio, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const soundRef = useRef(null);

  useEffect(() => {
    if (visible && audio) {
      // Initialize audio when modal opens
      // initializeAudio();
    }
    return () => {
      // Clean up audio when modal closes
      if (soundRef.current) {
        // soundRef.current.stop();
        // soundRef.current.release();
      }
    };
  }, [visible, audio]);

  const initializeAudio = () => {
    // Uncomment when react-native-sound is installed
    /*
    Sound.setCategory('Playback');
    
    soundRef.current = new Sound(audio.audioUrl, '', (error) => {
      if (error) {
        console.log('Failed to load the sound', error);
        return;
      }
      setDuration(soundRef.current.getDuration());
    });
    */
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const playAudio = () => {
    // Uncomment when react-native-sound is installed
    /*
    if (soundRef.current) {
      soundRef.current.play((success) => {
        if (success) {
          console.log('Successfully finished playing');
        } else {
          console.log('Playback failed due to audio decoding errors');
        }
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
    */
    setIsPlaying(true); // Temporary for UI demo
  };

  const pauseAudio = () => {
    // Uncomment when react-native-sound is installed
    /*
    if (soundRef.current) {
      soundRef.current.pause();
    }
    */
    setIsPlaying(false);
  };

  const seekToTime = (time) => {
    // Uncomment when react-native-sound is installed
    /*
    if (soundRef.current) {
      soundRef.current.setCurrentTime(time);
    }
    */
    setCurrentTime(time);
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    // Uncomment when react-native-sound is installed
    /*
    if (soundRef.current) {
      soundRef.current.setVolume(newMutedState ? 0 : volume);
    }
    */
  };

  const adjustVolume = (newVolume) => {
    setVolume(newVolume);
    if (!isMuted) {
      // Uncomment when react-native-sound is installed
      /*
      if (soundRef.current) {
        soundRef.current.setVolume(newVolume);
      }
      */
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!audio) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
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

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Slider
              style={styles.progressSlider}
              value={currentTime}
              minimumValue={0}
              maximumValue={duration || 100} // Default to 100 for demo
              minimumTrackTintColor="#4B0082"
              maximumTrackTintColor="#e5e7eb"
              thumbStyle={styles.sliderThumb}
              onSlidingComplete={seekToTime}
            />
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.timeText}>{formatTime(duration || 180)}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlIcon}>⏮</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.playPauseButton}
              onPress={togglePlayPause}
            >
              <Text style={styles.playPauseIcon}>
                {isPlaying ? "⏸" : "▶"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlIcon}>⏭</Text>
            </TouchableOpacity>
          </View>

          {/* Volume Control */}
          <View style={styles.volumeContainer}>
            <TouchableOpacity onPress={toggleMute} style={styles.muteButton}>
              <Text style={styles.muteIcon}>{isMuted ? "🔇" : "🔊"}</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.9,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 24,
    color: "#6b7280",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  placeholder: {
    width: 30,
  },
  albumArtContainer: {
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  albumArt: {
    width: 200,
    height: 200,
    borderRadius: 15,
  },
  trackInfo: {
    alignItems: "center",
    marginBottom: 30,
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 5,
  },
  artistName: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  progressContainer: {
    width: "100%",
    marginBottom: 30,
  },
  progressSlider: {
    width: "100%",
    height: 40,
  },
  sliderThumb: {
    backgroundColor: "#4B0082",
    width: 15,
    height: 15,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  timeText: {
    fontSize: 12,
    color: "#6b7280",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  controlButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
  },
  controlIcon: {
    fontSize: 24,
    color: "#6b7280",
  },
  playPauseButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#4B0082",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
  },
  playPauseIcon: {
    fontSize: 30,
    color: "white",
    marginLeft: 2,
  },
  volumeContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  muteButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  muteIcon: {
    fontSize: 20,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },
});
