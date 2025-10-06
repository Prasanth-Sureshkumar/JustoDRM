import React, { useEffect, useRef } from 'react';
import { 
  Alert, 
  Platform, 
  AppState, 
  View, 
  StyleSheet,
  Text,
  NativeEventEmitter
} from 'react-native';

const ScreenshotProtection = ({ children, onScreenshotDetected }) => {
  const appState = useRef(AppState.currentState);
  const isBlurred = useRef(false);

  useEffect(() => {
    let screenshotSubscription;

    if (Platform.OS === 'ios') {
      const eventEmitter = new NativeEventEmitter();
      screenshotSubscription = eventEmitter.addListener(
        'UIApplicationUserDidTakeScreenshotNotification',
        () => {
          handleScreenshotDetected();
        }
      );
    }

    const handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        isBlurred.current = false;
        console.log('App became active');
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        isBlurred.current = true;
        console.log('App went to background - content hidden for security');
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (screenshotSubscription) {
        screenshotSubscription.remove();
      }
      subscription?.remove();
    };
  }, []);

  const handleScreenshotDetected = () => {
    console.log('Screenshot detected!');
    Alert.alert(
      '🚨 Security Alert',
      'Screenshots and screen recording are not permitted in this application for security and privacy reasons.',
      [
        { 
          text: 'Understood', 
          style: 'default',
          onPress: () => {
            if (onScreenshotDetected) {
              onScreenshotDetected();
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  if (isBlurred.current) {
    return (
      <View style={styles.securityOverlay}>
        <Text style={styles.securityText}>🔒 Content Hidden</Text>
        <Text style={styles.securitySubtext}>For Security & Privacy</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  securityOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  securitySubtext: {
    color: '#ccc',
    fontSize: 16,
  },
});

export default ScreenshotProtection;
