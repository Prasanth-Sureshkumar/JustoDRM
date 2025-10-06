import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



import RealFileEpubReader from "../components/EnhancedRealFileEpubReader";
import ScreenshotProtection from "../components/ScreenshotProtection";
import BookList from "./ListAllBooks";

export default function HomeScreen({ navigation }) {
  const isDarkMode = useColorScheme() === "dark";
  const [currentMode, setCurrentMode] = useState("menu");

  const backgroundStyle = {
    backgroundColor: isDarkMode ? 'black' : 'white',
    flex: 1,
  };

  if (currentMode === "reader") {
    return <RealFileEpubReader onBack={() => setCurrentMode("menu")} />;
  }

  return (
    <ScreenshotProtection>
      <SafeAreaView style={[styles.container, backgroundStyle]}>
        {/* <View style={styles.header}>
          <Text style={styles.title}>📚 EPUB Reader</Text>
          <Text style={styles.subtitle}>Read EPUB files from your device</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setCurrentMode("reader")}
          >
            <Text style={styles.menuButtonIcon}>📱</Text>
            <Text style={styles.menuButtonTitle}>Select EPUB File</Text>
            <Text style={styles.menuButtonDesc}>
              Browse and read EPUB files from your device storage
            </Text>
          </TouchableOpacity>
        </View> */}
        <BookList navigation={navigation} />
      </SafeAreaView>
    </ScreenshotProtection>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: "#7f8c8d", textAlign: "center" },
  menuContainer: { flex: 1, padding: 20 },
  menuButton: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  menuButtonIcon: { fontSize: 32, textAlign: "center", marginBottom: 8 },
  menuButtonTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 5,
  },
  menuButtonDesc: { fontSize: 14, color: "#7f8c8d", textAlign: "center", lineHeight: 20 },
});
