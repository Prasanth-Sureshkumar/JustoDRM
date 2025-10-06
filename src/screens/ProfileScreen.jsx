import React from "react";
import { View, Text, Button } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
    const { logout } = useAuth();
    
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <View style={{ marginTop: 10 }}>
        <Button title="Logout" onPress={logout} color="red" />
    </View>   
     </View>
  );
}
