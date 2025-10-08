import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const ShimmerLoader = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8, 
  style = {} 
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            opacity: shimmerOpacity,
            borderRadius,
          },
        ]}
      />
    </View>
  );
};

const BookCardShimmer = () => {
  return (
    <View style={styles.bookCardShimmer}>
      <ShimmerLoader 
        width="100%" 
        height={160} 
        borderRadius={10} 
        style={styles.bookImageShimmer}
      />
      <View style={styles.bookInfoShimmer}>
        <ShimmerLoader 
          width="80%" 
          height={16} 
          borderRadius={4}
          style={styles.titleShimmer}
        />
        <ShimmerLoader 
          width="60%" 
          height={12} 
          borderRadius={4}
          style={styles.authorShimmer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  shimmer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  bookCardShimmer: {
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
  bookImageShimmer: {
    marginBottom: 10,
  },
  bookInfoShimmer: {
    alignItems: 'center',
  },
  titleShimmer: {
    marginBottom: 8,
  },
  authorShimmer: {
    marginBottom: 4,
  },
});

export { ShimmerLoader, BookCardShimmer };