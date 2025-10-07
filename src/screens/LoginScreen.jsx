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
  container: { flexGrow: 1, padding: 20, justifyContent: "center" },
  logoContainer: {
    alignSelf: "center",
    backgroundColor: "#010f29",
    width: 180,
    height: 190,
    borderRadius: 20,
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 220,
    alignSelf: "center",
    marginBottom: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 20,
    borderRadius: 25,
  },
  loginButton: {
    width: 100,
    backgroundColor: "#010f29",
    alignSelf: "center",
    borderRadius: 20,
  },
  loginButtonText: {
    alignSelf: "center",
    padding: 10,
    color: "white",
  },
});
