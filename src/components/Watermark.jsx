import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Watermark = ({
  text = "PROTECTED CONTENT",
  opacity = 0.1,
  fontSize = 48,
  color = '#000000',
  rotation = '-45deg'
}) => {
  return (
    <View style={styles.watermarkContainer} pointerEvents="none">
      <Text 
        style={[
          styles.watermarkText,
          {
            opacity,
            fontSize,
            color,
            transform: [{ rotate: rotation }]
          }
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  watermarkText: {
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default Watermark;
