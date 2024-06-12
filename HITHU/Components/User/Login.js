import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { Icon, Skeleton } from "@rneui/themed";
import Styles from "./Styles";
import { LinearGradient } from "expo-linear-gradient";
import { TextInput } from "react-native-paper";
import axios from "axios";
import { CLIENT_ID, CLIENT_SECRET } from "@env";
import APIs, { endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from '@rneui/themed';

// Custom TextInputIcon component
const TextInputIcon = ({ name, ...props }) => {
  return <Icon name={name} {...props} />;
};

TextInputIcon.defaultProps = {
  name: 'account', // Set a default value for the name prop
};

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("grant_type", "password");
    formData.append("client_id", CLIENT_ID);
    formData.append("client_secret", CLIENT_SECRET);
  
    try {
      const response = await APIs.post(endpoints.login, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      const { access_token, expires_in, refresh_token } = response.data;
  
      const expirationTime = new Date().getTime() + expires_in * 1000;
      await AsyncStorage.setItem("accessToken", access_token);
      await AsyncStorage.setItem("expirationTime", expirationTime.toString());
      await AsyncStorage.setItem("refreshToken", refresh_token);
  
      onLoginSuccess(access_token);
    } catch (error) {
      if (error.response) {
        console.error("Login Error (Response):", error.response.data);
        if (error.response.data.error === "invalid_grant") {
          Alert.alert("Login Error", "Tài khoản hoặc mật khẩu sai, xin vui lòng nhập lại");
        } else {
          Alert.alert("Login Error", `Server Error: ${error.response.data.message || error.response.data}`);
        }
      } else if (error.request) {
        console.error("Login Error (Request):", error.request);
        Alert.alert("Login Error", "No response received from server. Please try again.");
      } else {
        console.error("Login Error:", error.message);
        Alert.alert("Login Error", `Unexpected Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={Styles.container}>
      <Text style={Styles.title}>Đăng nhập</Text>

      <TextInput
        value={username}
        onChangeText={setUsername}
        style={Styles.inputContent}
        placeholder="Tài khoản"
        right={<TextInputIcon />} // Use the custom TextInputIcon component
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        style={Styles.inputContent}
        placeholder="Mật khẩu"
        secureTextEntry
        right={<TextInputIcon name="eye" />} // Use the custom TextInputIcon component with a different name
      />

      {loading ? (
        <LinearGradient
          colors={["#C6E9F6", "#009AD5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 5, marginTop: 10, padding: 10 }}
        >
          <Skeleton
            animation="wave"
            height={28}
            width={90}
            style={{ alignSelf: "center" }}
          />
        </LinearGradient>
      ) : (
        <Button
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: ["#C6E9F6", "#009AD5"],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          title="Đăng nhập"
          buttonStyle={{ borderRadius: 5, marginTop: 10 }}
          titleStyle={{ color: "white", fontWeight: "bold", fontSize: 18 }}
          loading={loading}
          onPress={handleLogin}
        />
      )}
      <Text style={{ marginTop: 15, fontSize: 16 }}>hoặc</Text>
      <Button
        title="Đăng nhập bằng gmail"
        icon={
          <Icon
            name="google"
            type="font-awesome"
            size={24}
            color="white"
            style={{ marginRight: 10 }}
          />
        }
        buttonStyle={{
          backgroundColor: "#DB4437",
          borderRadius: 5,
          padding: 10,
          marginTop: 30,
        }}
        titleStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}
        onPress={() => {
          /* Handle Google login */
        }}
      />
      <Button
        title="Đăng nhập bằng facebook"
        icon={
          <Icon
            name="facebook"
            type="font-awesome"
            size={24}
            color="white"
            style={{ marginRight: 10 }}
          />
        }
        buttonStyle={{
          backgroundColor: "#4267B2",
          borderRadius: 5,
          padding: 10,
          marginTop: 10,
        }}
        titleStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}
        onPress={() => {
          /* Handle Facebook login */
        }}
      />
    </View>
  );
};

export default Login;
