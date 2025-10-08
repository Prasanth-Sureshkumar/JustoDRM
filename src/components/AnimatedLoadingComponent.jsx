import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';

const AnimatedLoadingComponent = ({ 
  visible = false, 
  loadingText = "Loading...", 
  subText = "Please wait", 
  backgroundColor = 'rgba(255, 255, 255, 1)' 
}) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      startLoadingAnimations();
    }
  }, [visible]);

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

  if (!visible) return null;

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
    <View style={[styles.loadingOverlay, { backgroundColor }]}>
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
            {loadingText}
          </Animated.Text>
          
          <Text style={styles.loadingSubtext}>
            {subText}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
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

export default AnimatedLoadingComponent;