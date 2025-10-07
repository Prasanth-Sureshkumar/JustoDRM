import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from "react-native";
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
      <View style={{alignSelf:'center', backgroundColor: '#010f29', width: 180,  height: 190, borderRadius : 20, marginBottom: 20 }}>
      <Image source={require('../assets/Logo.png')} style={{width: 200, height: 220, alignSelf:'center', marginBottom:0}} />
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
      {loading ? <ActivityIndicator /> : <TouchableOpacity style={{width: 100, backgroundColor:'#010f29', alignSelf:'center', borderRadius: 20}} onPress={handleLogin} >
        <Text style={{alignSelf:'center', padding : 10, color : 'white'}}> Login </Text>
        </TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 20, borderRadius: 25 },
});
