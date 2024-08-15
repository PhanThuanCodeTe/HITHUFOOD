import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { Button, CheckBox } from "@rneui/base";
import { HelperText, TextInput, IconButton } from "react-native-paper";
import Styles from "./Styles";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import APIs, { endpoints } from "../../configs/APIs";

const fields = [
  {
    label: "Tên",
    icon: "text",
    name: "first_name",
  },
  {
    label: "Họ và tên lót",
    icon: "text",
    name: "last_name",
  },
  {
    label: "Tên đăng nhập",
    icon: "account",
    name: "username",
  },
  {
    label: "Mật khẩu",
    icon: "eye",
    secureTextEntry: true,
    name: "password",
  },
  {
    label: "Xác nhận mật khẩu",
    icon: "eye",
    secureTextEntry: true,
    name: "confirm",
  },
  {
    label: "Số điện thoại",
    icon: "phone",
    name: "phone",
  },
  {
    label: "Email",
    icon: "form",
    name: "email",
  },
];

const Register = ({ onRegisterSuccess }) => {
  const [user, setUser] = useState({});
  const [error, setError] = useState({
    passwordMismatch: false,
    invalidPhone: false,
    genderNotSelected: false,
  });
  const [gender, setGender] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateState = (name, value) => {
    setUser((prevState) => ({ ...prevState, [name]: value }));
  };

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^(03|08|05|07)\d{8}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleRegister = async () => {
    const { password, confirm, phone } = user;
    let passwordMismatch = password !== confirm;
    let invalidPhone = !validatePhoneNumber(phone);
    let genderNotSelected = gender === null;

    if (passwordMismatch || invalidPhone || genderNotSelected) {
      setError({ passwordMismatch, invalidPhone, genderNotSelected });
      return;
    }

    setError({
      passwordMismatch: false,
      invalidPhone: false,
      genderNotSelected: false,
    });
    setLoading(true);

    const formDataObject = {
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      password: user.password,
      phone_number: user.phone,
      email: user.email,
      gender: gender === "Nam" ? "1" : "0",
    };

    const formData = new FormData();
    for (const key in formDataObject) {
      formData.append(key, formDataObject[key]);
    }

    console.log("Form Data:", formDataObject);

    try {
      const res = await axios.post(
        APIs.defaults.baseURL + endpoints.register,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 201) {
        Alert.alert(
          "Success",
          "Đăng ký tài khoản thành công. Bạn sẽ được dẫn về trang đăng nhập!",
          [{ text: "OK" }]
        );
        setTimeout(() => {
          onRegisterSuccess(); // Notify success and switch screen
        }, 1000);
      } else {
        Alert.alert("Error", "Xảy ra 1 số lỗi, xin vui lòng thử lại sau.", [
          { text: "OK" },
        ]);
      }
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
      Alert.alert("Error", "Xảy ra 1 số lỗi, xin vui lòng thử lại sau.", [
        { text: "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={Styles.container}
    >
      <ScrollView contentContainerStyle={Styles.scrollViewContent}>
        <Text style={Styles.title}>Đăng ký</Text>
        {fields.map((field) => (
          <View
            key={field.name}
            style={{ marginBottom: error[field.name] ? 10 : 0 }}
          >
            <TextInput
              value={user[field.name] || ""}
              onChangeText={(text) => updateState(field.name, text)}
              style={Styles.inputContent}
              placeholder={field.label}
              secureTextEntry={field.secureTextEntry}
              right={
                <IconButton
                  icon={field.icon}
                  onPress={() => console.log("Pressed")}
                  color={"gray"}
                />
              }
              keyboardType={
                field.name === "first_name" || field.name === "last_name"
                  ? "name-phone-pad"
                  : "default"
              }
              autoCapitalize={
                field.name === "first_name" || field.name === "last_name"
                  ? "words"
                  : "none"
              }
            />
            {field.name === "confirm" && error.passwordMismatch && (
              <HelperText type="error" visible={true}>
                Mật khẩu không khớp!
              </HelperText>
            )}
            {field.name === "phone" && error.invalidPhone && (
              <HelperText type="error" visible={true}>
                Không đúng định dạng số điện thoại!
              </HelperText>
            )}
          </View>
        ))}

        <View style={Styles.genderContainer}>
          <Text style={Styles.genderText}>Giới tính:</Text>
          <CheckBox
            title="Nam"
            checked={gender === "Nam"}
            onPress={() => setGender("Nam")}
            containerStyle={Styles.checkboxContainer}
            textStyle={Styles.checkboxText}
          />
          <CheckBox
            title="Nữ"
            checked={gender === "Nữ"}
            onPress={() => setGender("Nữ")}
            containerStyle={Styles.checkboxContainer}
            textStyle={Styles.checkboxText}
          />
        </View>
        {error.genderNotSelected && (
          <HelperText type="error" visible={true}>
            Vui lòng chọn giới tính!
          </HelperText>
        )}

        <Button
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: ["#C6E9F6", "#009AD5"],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          title="Đăng ký"
          buttonStyle={{ borderRadius: 5, padding: 10, marginTop: 10 }}
          titleStyle={{ color: "white", fontWeight: "bold", fontSize: 18 }}
          loading={loading}
          onPress={handleRegister}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;
