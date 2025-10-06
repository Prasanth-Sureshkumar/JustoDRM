import { LOGIN_URL } from '../constants/apiUrls';
import api from '../http/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const login = async (payload) => {
  try {
    const res = await api.post(LOGIN_URL, payload);
    if (res && res.data) {
      if (res.data.token) {
        await AsyncStorage.setItem('@auth_token', res.data.token);
      }
      return res.data;
    }

    throw new Error('Empty response from server');
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Login failed';
    throw new Error(message);
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem('@auth_token');
  } catch (err) {
    console.warn('Logout error', err);
  }
};
