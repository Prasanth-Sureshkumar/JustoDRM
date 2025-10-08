import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../http/axiosInstance";
import { LOGIN_URL } from "../constants/apiUrls";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const login = async (payload) => {
    setLoading(true);
    try {
      const res = await api.post(LOGIN_URL, payload);

      if (res?.data) {
        const token = res.data.token;
        const userData = res.data.user;

        if (token) {
          await AsyncStorage.setItem("@auth_token", token);
        }

        setUser(userData || { name: payload.username });

        return true;
      }

      return false;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const getToken = async () => {
    return await AsyncStorage.getItem("@auth_token");
  };
  
  const isLoggedIn = async () => {
    const token = await getToken();
    return !!token;
  };

  const logout = async () => {
    setUser(null);
    try {
      await AsyncStorage.removeItem("@auth_token");
    } catch (err) {
      console.warn("Logout error", err);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("@auth_token");
        if (token) {
          setUser({ authenticated: true });
        }
      } catch (error) {
        console.warn("Error initializing auth:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isLoggedIn, isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
