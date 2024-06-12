import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import APIs, { endpoints } from '../../configs/APIs';

export const AuthContext = createContext();

export const AuthProvider = ({ children, navigation }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      const expirationTime = await AsyncStorage.getItem("expirationTime");
      const refreshToken = await AsyncStorage.getItem("refreshToken");

      if (token && expirationTime) {
        const now = new Date().getTime();
        if (now < parseInt(expirationTime, 10)) {
          setAccessToken(token);
          fetchUserInfo(token);
        } else if (refreshToken) {
          await refreshAccessToken(refreshToken);
        } else {
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("expirationTime");
        }
      }
    };

    loadToken();
  }, []);

  const fetchUserInfo = async (token) => {
    try {
      const response = await APIs.get(endpoints['current-user'], {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUserInfo(response.data);
    } catch (error) {
      console.error("Fetch User Info Error:", error);
    }
  };

  const refreshAccessToken = async (refreshToken) => {
    const formData = new FormData();
    formData.append("grant_type", "refresh_token");
    formData.append("refresh_token", refreshToken);
    formData.append("client_id", CLIENT_ID);
    formData.append("client_secret", CLIENT_SECRET);

    try {
      const response = await APIs.post(endpoints.refreshToken, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { access_token, expires_in, refresh_token } = response.data;

      const expirationTime = new Date().getTime() + expires_in * 1000;
      await AsyncStorage.setItem("accessToken", access_token);
      await AsyncStorage.setItem("expirationTime", expirationTime.toString());
      await AsyncStorage.setItem("refreshToken", refresh_token);

      setAccessToken(access_token);
      fetchUserInfo(access_token);
    } catch (error) {
      console.error("Refresh Token Error:", error);
    }
  };

  const handleLoginSuccess = async (token) => {
    setAccessToken(token);
    fetchUserInfo(token);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("expirationTime");
    await AsyncStorage.removeItem("refreshToken");
    setAccessToken(null);
    setUserInfo(null);
    navigation.navigate('User');
  };

  return (
    <AuthContext.Provider value={{ accessToken, userInfo, handleLoginSuccess, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
