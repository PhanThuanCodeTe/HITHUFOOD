import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  RefreshControl,
} from "react-native";
import AppStyles from "../../Styles/AppStyles";
import Styles from "./Styles";
import { useNavigation, useRoute } from "@react-navigation/native";
import { authAPI, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { Overlay, Button } from "@rneui/themed";
import * as ImagePicker from "expo-image-picker";

const backGround = require("../../Templates/Images/BackGround.png");

const Store = () => {
  const [store, setStore] = useState(null);
  const [foods, setFoods] = useState([]);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();
  const storeId = route.params?.storeId;

  useEffect(() => {
    const fetchStoreAndFoods = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      try {
        const api = authAPI(token);
        const storeResponse = await api.get(
          endpoints["current-store"](storeId)
        );
        setStore(storeResponse.data);

        const foodsResponse = await api.get(
          endpoints["curent-store-food"](storeId)
        );
        setFoods(foodsResponse.data);
      } catch (error) {
        console.error("Error fetching store or foods data:", error);
      }
    };

    if (storeId) {
      fetchStoreAndFoods();
    }
  }, [storeId]);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      const fetchStoreAndFoods = async () => {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          console.error("No access token found");
          return;
        }

        try {
          const api = authAPI(token);
          const storeResponse = await api.get(
            endpoints["current-store"](storeId)
          );
          setStore(storeResponse.data);

          const foodsResponse = await api.get(
            endpoints["curent-store-food"](storeId)
          );
          setFoods(foodsResponse.data);
        } catch (error) {
          console.error("Error fetching store or foods data:", error);
        }
      };

      if (storeId) {
        await fetchStoreAndFoods();
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setOverlayVisible(true);
  };

  const handleFoodPress = (food) => {
    navigation.navigate("FoodSettings", { food });
  };

  const handleImagePicker = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setAvatar(result.assets[0]);
    }
  };

  const handleOverlaySubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const api = authAPI(token);

      if (selectedItem === "avatar" && avatar) {
        const formData = new FormData();
        formData.append("avatar", {
          uri: avatar.uri,
          type: "image/jpeg",
          name: "avatar.jpg",
        });

        await api.patch(endpoints["current-store"](storeId), formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
      } else if (selectedItem === "name" && inputValue) {
        const formData = new FormData();
        formData.append("name", inputValue);

        await api.patch(
          endpoints["current-store"](storeId),
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setOverlayVisible(false);
      setAvatar(null);
      setInputValue("");
      await refreshData();
    } catch (error) {
      console.error("Error submitting form data:", error);
    }
  };

  if (!store) {
    return (
      <ImageBackground source={backGround} style={AppStyles.background}>
        <Text style={Styles.h1}>Đang tải thông tin cửa hàng...</Text>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={backGround} style={AppStyles.background}>
      <View>
        <Text style={Styles.h1}>Cài đặt cửa hàng</Text>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
      >
        <View style={AppStyles.flex}>
          <View style={AppStyles.flex}>
            <TouchableOpacity onPress={() => handleItemPress("avatar")}>
              <Image style={Styles.avatar} source={{ uri: store.avatar }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleItemPress("name")}>
              <Text style={Styles.storename}>{store.name}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <Text style={[Styles.h1, { textAlign: "left" }]}>
            {" "}
            Thêm/Xóa/Chỉnh sửa món ăn
          </Text>
          {foods.map((food, index) => (
            <TouchableOpacity key={index} onPress={() => handleFoodPress(food)}>
              <View style={[Styles.box, AppStyles.flex]}>
                <Image style={Styles.foodimage} source={{ uri: food.image }} />
                <View style={Styles.textContainer}>
                  <Text style={Styles.foodname}>{food.name}</Text>
                  <Text style={Styles.fooddescription}>
                    {food.description || "Không có mô tả nào"}
                  </Text>
                  <Text style={Styles.foodprice}>Giá: {food.price} VND</Text>
                  <Text style={Styles.foodrating}>
                    Đánh giá: {food.average_rating}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Overlay
        isVisible={overlayVisible}
        onBackdropPress={() => setOverlayVisible(false)}
        overlayStyle={Styles.overlay}
      >
        <View style={{ padding: 20 }}>
          <Text style={Styles.overlayTitle}>Chỉnh sửa thông tin</Text>
          {selectedItem === "avatar" ? (
            <View>
              <Text style={Styles.overlaySubTitle}>Ảnh cũ</Text>
              <View style={{ alignItems: "center" }}>
                <Image style={Styles.avatar} source={{ uri: store.avatar }} />
              </View>
              <View>
                <Text style={Styles.overlaySubTitle}>Ảnh mới:</Text>
                <TouchableOpacity
                  onPress={handleImagePicker}
                  style={[Styles.imagePicker, avatar && { borderWidth: 0 }]}
                >
                  {avatar ? (
                    <Image source={{ uri: avatar.uri }} style={Styles.avatar} />
                  ) : (
                    <Text>Chọn ảnh</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <Text style={Styles.overlaySubTitle}>Tên cũ:</Text>
              <Text style={{ fontSize: 18 }}>{store.name}</Text>
              <Text style={Styles.overlaySubTitle}>Tên mới:</Text>
              <TextInput
                style={Styles.input}
                value={inputValue}
                onChangeText={setInputValue}
              />
            </View>
          )}
          <Button
            title="Xác nhận"
            onPress={() =>
              Alert.alert(
                "Lưu ý",
                "Bạn có muốn áp dụng thay đổi này?",
                [
                  {
                    text: "Không",
                    onPress: () => {
                      setAvatar(null);
                      setInputValue("");
                      setOverlayVisible(false);
                    },
                    style: "cancel",
                  },
                  {
                    text: "Có",
                    onPress: handleOverlaySubmit,
                  },
                ],
                { cancelable: false }
              )
            }
          />
        </View>
      </Overlay>
    </ImageBackground>
  );
};

export default Store;
