import React, { useContext, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import { useAuth } from "../context/AuthContext";

export default function AppNavigator() {
  const { user, loading, isLoggedIn } = useAuth();
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    setAppLoading(false);
  }, []);

  if (loading || appLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
