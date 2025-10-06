import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";
import DeviceInfo from 'react-native-device-info';


export default function LoginScreen({ navigation }) {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [deviceHash, setDeviceHash] = useState('');


  const handleLogin = async () => {
    try {
      await login({ username, password, deviceHash });
      Alert.alert("Success", 'Logged in successfully');
    } catch (err) {
      Alert.alert("Login failed", err.message);
    }
  };

  React.useEffect(() => {
  const fetchDeviceId = async () => {
    const uniqueId = await DeviceInfo.getUniqueId();
    setDeviceHash(uniqueId);
  };
  fetchDeviceId();
}, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
      {loading ? <ActivityIndicator /> : <Button title="Login" onPress={handleLogin} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 12, borderRadius: 8 },
});
