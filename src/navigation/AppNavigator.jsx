import React, { useContext, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import { useAuth } from "../context/AuthContext";
import { ActivityIndicator, Text, View, StyleSheet } from "react-native";

export default function AppNavigator() {
  const { user, loading, isLoggedIn, isInitializing } = useAuth();

  if (loading || isInitializing) {
    return ( 
      <View style={styles.loaderContainer}>
        <Text style={styles.loadingText}>Initializing app, please wait...</Text>
        <ActivityIndicator size="large" color="#4B0082"/>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginBottom: 10,
    fontSize: 16,
    color: '#333',
  }
});