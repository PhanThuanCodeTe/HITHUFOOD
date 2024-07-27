import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Alert,
  TextInput,
  RefreshControl,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import Styles from "./Styles";
import AppStyles from "../../Styles/AppStyles";
import axios, { authAPI, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Overlay } from "@rneui/themed";
import * as ImagePicker from "expo-image-picker";

const backGround = require("../../Templates/Images/BackGround.png");

const FoodSettings = () => {
  const route = useRoute();
  const initialFood = route.params.food;
  const [food, setFood] = useState(initialFood);
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [newName, setNewName] = useState(food.name);
  const [newDescription, setNewDescription] = useState(food.description);
  const [newPrice, setNewPrice] = useState(food.price);
  const [newToppingName, setNewToppingName] = useState("");
  const [newToppingPrice, setNewToppingPrice] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const handleImagePicker = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setNewImage(result.assets[0].uri); // Set the selected image URI
    }
  };
  useEffect(() => {
    fetchToppings();
  }, [food.id]);

  const fetchToppings = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const api = authAPI(token); // Create an authenticated API instance
      const response = await api.get(endpoints["food-topping"](food.id));
      setToppings(response.data);
    } catch (err) {
      console.error("Error fetching toppings:", err);
      setError("Không thể load topping!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopping = async (toppingId) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      await authAPI(token).delete(
        endpoints["delete-topping"](food.id, toppingId),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Thông báo", "Đã xóa Topping thành công");
      fetchToppings(); // Refetch toppings after successful deletion
    } catch (err) {
      console.error("Error deleting topping:", err);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi xóa topping!");
    }
  };

  if (loading) {
    return (
      <View style={Styles.centered}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={Styles.centered}>
        <Text style={Styles.errorText}>{error}</Text>
      </View>
    );
  }
  const handleOverlayOpen = (item) => {
    setSelectedItem(item);
    setOverlayVisible(true);
  };

  const handleOverlaySubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const api = authAPI(token);
      const formData = new FormData();

      if (selectedItem === "image") {
        if (newImage) {
          formData.append("image", {
            uri: newImage,
            name: "food_image.jpg",
            type: "image/jpeg",
          });
        }
      } else if (selectedItem === "name") {
        formData.append("name", newName);
      } else if (selectedItem === "description") {
        formData.append("description", newDescription);
      } else if (selectedItem === "price") {
        formData.append("price", newPrice);
      } else if (selectedItem === "addTopping") {
        formData.append("name", newToppingName);
        formData.append("price", newToppingPrice);
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      // Send data based on the selected item
      if (selectedItem !== "addTopping") {
        const response = await api.patch(
          endpoints["update-food"](food.id),
          formData,
          config
        );
        setFood(response.data);
        Alert.alert("Thông báo", "Cập nhật thành công");
      } else {
        const response = await api.post(
          endpoints["food-topping"](food.id),
          formData,
          config
        );
        Alert.alert("Thông báo", "Thêm Topping thành công");
      }

      setOverlayVisible(false);
      refreshData();
      setNewImage(null);
      setNewName(food.name);
      setNewDescription(food.description);
      setNewPrice(food.price);
      setNewToppingName("");
      setNewToppingPrice("");
    } catch (err) {
      console.error("Error updating food:", err);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi cập nhật món ăn!");
    }
  };

  const handleChangeStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }
  
      const api = authAPI(token);
      const formData = new FormData();
      formData.append("active", food.active ? 0 : 1);
  
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };
  
      const response = await api.patch(endpoints["update-food"](food.id), formData, config);
      setFood(response.data);
      Alert.alert("Thông báo", "Cập nhật trạng thái thành công");
    } catch (err) {
      console.error("Error updating food status:", err);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi cập nhật trạng thái món ăn!");
    }
  };
  

  const refreshData = async () => {
    setRefreshing(true);
    await fetchToppings();
    setRefreshing(false);
  };

  return (
    <ImageBackground source={backGround} style={AppStyles.background}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
      >
        <View>
          <Text style={Styles.h1}>Cài đặt món ăn</Text>
          <TouchableOpacity onPress={() => handleOverlayOpen("image")}>
            <Image
              style={Styles.extendedfoodiamge}
              source={{ uri: food.image }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleOverlayOpen("name")}>
            <Text style={[Styles.title, { fontSize: 24, marginLeft: 10 }]}>
              {food.name}
            </Text>
          </TouchableOpacity>
          <View
            style={[
              Styles.priceContainer,
              AppStyles.flex,
              Styles.statusContainer,
            ]}
          >
            <View style={Styles.statusRow}>
              <Text style={[Styles.text, {marginLeft:5}]}>Trạng thái:</Text>
              <Text style={Styles.statusText}>
                {food.active ? "Đang bán" : "Ngưng bán"}
              </Text>
            </View>
            <Button title="Thay đổi" buttonStyle={Styles.changeStatusButton} onPress={handleChangeStatus}/>
          </View>

          <Text style={Styles.foodrating}>Đánh giá: {food.average_rating}</Text>
          <TouchableOpacity onPress={() => handleOverlayOpen("description")}>
            <View style={Styles.borderbox}>
              <Text style={Styles.fooddescription}>
                {food.description || "Thêm mô tả cho món ăn!"}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleOverlayOpen("price")}>
            <View style={[Styles.priceContainer, AppStyles.flex]}>
              <Text style={Styles.text}>Giá:</Text>
              <Text style={Styles.priceText}>{formatPrice(food.price)} đ</Text>
            </View>
          </TouchableOpacity>
          <Text style={Styles.title}>Topping:</Text>
          {toppings.length > 0 ? (
            toppings.map((topping) => (
              <View key={topping.id} style={Styles.toppingBox}>
                <View style={Styles.toppingInfo}>
                  <Text style={Styles.toppingName}>{topping.name}</Text>
                  <Text style={Styles.toppingPrice}>
                    {formatPrice(topping.price)} đ
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Cảnh báo!",
                      "Bạn chắn chắn xóa topping này không?",
                      [
                        {
                          text: "Không",
                          onPress: () => {},
                          style: "cancel",
                        },
                        {
                          text: "Có",
                          onPress: () => handleDeleteTopping(topping.id),
                        },
                      ],
                      { cancelable: false }
                    );
                  }}
                  style={Styles.deleteButton}
                >
                  <Text style={Styles.deleteButtonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={Styles.noToppingsText}>
              Cửa hàng chưa đăng món ăn nào
            </Text>
          )}
          <Button
            title="Thêm Topping cho món ăn"
            onPress={() => handleOverlayOpen("addTopping")}
            buttonStyle={{ marginBottom: 15 }}
          />
        </View>
      </ScrollView>
      <Overlay
        isVisible={overlayVisible}
        onBackdropPress={() => setOverlayVisible(false)}
        overlayStyle={Styles.overlay}
      >
        {selectedItem === "image" ? (
          <View style={Styles.overlayContent}>
            <Text style={Styles.overlayTitle}>Thay đổi ảnh</Text>
            <Text style={Styles.overlaySubTitle}>Ảnh cũ:</Text>
            <Image style={Styles.centeredImage} source={{ uri: food.image }} />
            <Text style={Styles.overlaySubTitle}>Ảnh mới:</Text>
            <TouchableOpacity
              onPress={handleImagePicker}
              style={Styles.imagePicker}
            >
              {newImage ? (
                <Image
                  source={{ uri: newImage }}
                  style={Styles.centeredImage}
                />
              ) : (
                <Text>Chọn ảnh</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : selectedItem === "name" ? (
          <View>
            <Text style={Styles.overlayTitle}>Thay đổi tên</Text>
            <Text style={Styles.overlaySubTitle}>Tên cũ: </Text>
            <Text>{food.name}</Text>
            <Text style={Styles.overlaySubTitle}>Tên mới:</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              style={Styles.input}
            />
          </View>
        ) : selectedItem === "description" ? (
          <View>
            <Text style={Styles.overlayTitle}>Thay đổi mô tả</Text>
            <Text style={Styles.overlaySubTitle}>
              Mô tả cũ: {food.description || "Không có mô tả"}
            </Text>
            <Text style={Styles.overlaySubTitle}>Mô tả mới:</Text>
            <TextInput
              value={newDescription}
              onChangeText={setNewDescription}
              style={Styles.input}
            />
          </View>
        ) : selectedItem === "price" ? (
          <View>
            <Text style={Styles.overlaySubTitle}>Thay đổi giá</Text>
            <Text style={Styles.overlaySubTitle}>
              Giá cũ: {formatPrice(food.price)} VND
            </Text>
            <Text style={Styles.overlaySubTitle}>Giá mới:</Text>
            <TextInput
              value={newPrice.toString()}
              onChangeText={setNewPrice}
              keyboardType="numeric"
              style={Styles.input}
            />
          </View>
        ) : selectedItem === "addTopping" ? (
          <View>
            <Text style={Styles.overlaySubTitle}>Thêm Topping mới</Text>
            <Text style={Styles.overlaySubTitle}>Tên:</Text>
            <TextInput
              value={newToppingName}
              onChangeText={setNewToppingName}
              style={Styles.input}
            />
            <Text style={Styles.overlaySubTitle}>Giá:</Text>
            <TextInput
              value={newToppingPrice}
              onChangeText={setNewToppingPrice}
              keyboardType="numeric"
              style={Styles.input}
            />
          </View>
        ) : null}
        <Button title="Xác nhận" onPress={handleOverlaySubmit} />
      </Overlay>
    </ImageBackground>
  );
};

const formatPrice = (price) => {
  const priceString = price.toString();
  const formattedPrice = priceString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return formattedPrice;
};

export default FoodSettings;
