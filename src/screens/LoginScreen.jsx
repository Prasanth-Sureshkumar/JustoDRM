import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  ActivityIndicator, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { showSuccessToast, showErrorToast } from "../components/CustomToast";
import { useAuth } from "../context/AuthContext";
import DeviceInfo from "react-native-device-info";

export default function LoginScreen({ navigation }) {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [deviceHash, setDeviceHash] = useState("");  

  const handleLogin = async () => {
    try {
      await login({ username, password, deviceHash });
      showSuccessToast("Success", "Logged in successfully");
    } catch (err) {
      showErrorToast("Login failed", err.message);
    }
  };

  useEffect(() => {
    const fetchDeviceId = async () => {
      const uniqueId = await DeviceInfo.getUniqueId();
      setDeviceHash(uniqueId);
    };
    fetchDeviceId();
  }, []);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      keyboardVerticalOffset={20} 
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/Logo.png")}
            style={styles.logo}
          />
        </View>
        
        <TextInput
          style={styles.input}
          value={username}
          placeholder="Username"
          autoCapitalize="none"
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          value={password}
          placeholder="Password"
          secureTextEntry
          onChangeText={setPassword}
        />

        {loading ? (
          <ActivityIndicator />
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 24, 
    justifyContent: "center",
    backgroundColor: "#f8fafc"
  },
  logoContainer: {
    alignSelf: "center",
    backgroundColor: "#010f29",
    width: 140,
    height: 140,
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    marginBottom: 16,
    borderRadius: 12,
    fontSize: 15,
    color: "#1e293b",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: "#010f29",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 12,
    alignSelf: "stretch",
    shadowColor: "#010f29",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  loginButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
});
