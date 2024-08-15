import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ImageBackground } from "react-native";
import Login from "./Login";
import Register from "./Register";
import Styles from "./Styles";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import APIs, {endpoints} from "../../configs/APIs";

const backGround = require("../../Templates/Images/BackGround.png");

const User = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const navigation = useNavigation();

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
    navigation.navigate("UserProfile");
  };

useEffect(() => {
  if (userInfo) {
    //console.log("Navigating to UserInfo with:", { userInfo, handleLogout });
    navigation.navigate("UserInfo", { userInfo, handleLogout, fetchUserInfo, setAccessToken, setUserInfo });
  }
}, [userInfo, fetchUserInfo, setAccessToken, handleLogout]); // Add handleLogout to the dependency array

  return (
    <ImageBackground source={backGround} style={Styles.background}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {accessToken ? (
          userInfo ? (
            <Text style={Styles.title}>Đang tải thông tin người dùng</Text>
          ) : (
            <Text style={Styles.title}>Đang tải thông tin người dùng</Text>
          )
        ) : (
          showRegister ? (
            <>
              <Register onRegisterSuccess={() => setShowRegister(false)} />
              <View style={[{ marginBottom: 50 }, Styles.row]}>
                <Text>Đã có tài khoản? </Text>
                <TouchableOpacity onPress={() => setShowRegister(false)}>
                  <Text style={Styles.switchText}>Quay lại trang đăng nhập</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Login onLoginSuccess={handleLoginSuccess} />
              <View style={[{ marginBottom: 50 }, Styles.row]}>
                <Text>Chưa có tài khoản? </Text>
                <TouchableOpacity onPress={() => setShowRegister(true)}>
                  <Text style={Styles.switchText}>Đăng ký ngay</Text>
                </TouchableOpacity>
              </View>
            </>
          )
        )}
      </View>
    </ImageBackground>
  );
};

export default User;

//1
