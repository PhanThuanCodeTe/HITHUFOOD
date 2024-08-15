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
import { GEOCODING_APIKEY } from "@env";
import { Chip } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

const backGround = require("../../Templates/Images/BackGround.png");
const data = require("../../data.json");

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
  const [houseStreet, setHouseStreet] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [wards, setWards] = useState([]);
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [newFoodName, setNewFoodName] = useState("");
  const [newFoodImage, setNewFoodImage] = useState(null);
  const [newFoodDescription, setNewFoodDescription] = useState("");
  const [newFoodPrice, setNewFoodPrice] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isAddingNewFood, setIsAddingNewFood] = useState(false);
  const [isAddFoodOverlayVisible, setIsAddFoodOverlayVisible] = useState(false);
  const [times, setTimes] = useState([]);

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
      fetchCategories();
      fetchTimes();
    }
  }, [storeId]);

  const handleDistrictChange = (district) => {
    setDistrict(district);
    const selectedDistrict = data.districts.find((d) => d.name === district);
    if (selectedDistrict) {
      setWards(selectedDistrict.wards);
    } else {
      setWards([]);
    }
    setWard("");
  };

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const api = authAPI(token);
      let allCategories = []; // Array to store all categories
      let nextPage = endpoints["category"]; // Start with the first page

      while (nextPage) {
        const response = await api.get(nextPage); // Fetch categories from the current page
        const { results, next } = response.data;
        allCategories = [...allCategories, ...results]; // Append categories to the array

        if (next) {
          nextPage = next; // If there's a next page, update nextPage to fetch the next page
        } else {
          nextPage = null; // If there's no next page, set nextPage to null to break the loop
        }
      }

      setCategories(allCategories); // Set the state with all categories
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTimes = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const api = authAPI(token);
      let allTimes = []; // Array to store all times
      let nextPage = endpoints["time"]; // Start with the first page

      while (nextPage) {
        const response = await api.get(nextPage); // Fetch times from the current page
        const { results, next } = response.data;
        allTimes = [...allTimes, ...results]; // Append times to the array

        if (next) {
          nextPage = next; // If there's a next page, update nextPage to fetch the next page
        } else {
          nextPage = null; // If there's no next page, set nextPage to null to break the loop
        }
      }

      setTimes(allTimes); // Set the state with all times
    } catch (error) {
      console.error("Error fetching times:", error);
    }
  };

  const handleCategorySelect = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleAddFoodPress = () => {
    setNewFoodName("");
    setNewFoodImage(null);
    setNewFoodDescription("");
    setNewFoodPrice("");
    setSelectedCategories([]);
    setIsAddFoodOverlayVisible(true);
  };

  const handleCancelAddFood = () => {
    setNewFoodName("");
    setNewFoodImage(null);
    setNewFoodDescription("");
    setNewFoodPrice("");
    setSelectedCategories([]);
    setIsAddFoodOverlayVisible(false);
  };

  const handleConfirmAddFood = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      const api = authAPI(token);
      const formData = new FormData();

      if (newFoodImage) {
        formData.append("image", {
          uri: newFoodImage.uri,
          type: "image/jpeg",
          name: "food_image.jpg",
        });
      }

      formData.append("name", newFoodName);
      formData.append("description", newFoodDescription);
      formData.append("price", newFoodPrice);
      formData.append("category", selectedCategories.join(","));

      await api.post(endpoints["create-food"](storeId), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setIsAddingNewFood(false);
      setNewFoodName("");
      setNewFoodImage(null);
      setNewFoodDescription("");
      setNewFoodPrice("");
      setSelectedCategories([]);
      refreshData();

      Alert.alert("Thông báo", "Đã tạo món ăn thành công!");
    } catch (error) {
      // console.error("Error adding new food:", error);
      if (error.response && error.response.status === 400) {
        // Handle specific error when server responds with status code 400
        Alert.alert(
          "Thông báo",
          "Không thể tạo món ăn. Vui lòng kiểm tra lại thông tin."
        );
      } else {
        // Handle other errors
        Alert.alert("Lỗi", "Vui lòng thử lại sau.");
      }
    }
  };

  const formatAddress = (address) => {
    let formattedAddress = address
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/,/g, "")
      .replace(/\s+/g, "-")
      .replace(/\bPhường\b|\bphuong\b/gi, "Ward")
      .replace(/\bQuận\b|\bquan\b/gi, "District");
    return formattedAddress + "+ho+chi+minh+city";
  };

  const fetchCoordinates = async () => {
    const formattedAddress = formatAddress(
      `${houseStreet}, ${ward}, ${district}`
    );
    const apiUrl = `https://geocode.maps.co/search?q=${formattedAddress}&api_key=${GEOCODING_APIKEY}`;
    try {
      const response = await fetch(apiUrl);
      const text = await response.text();
      const data = JSON.parse(text);
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setX(lat.toString());
        setY(lon.toString());
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error fetching geocode data:", error);
      return false;
    }
  };

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
    if (item === "address") {
      const [street, wardValue, districtValue] = store.address_line.split(", ");
      setHouseStreet(street);
      setWard(wardValue);
      setDistrict(districtValue);
      handleDistrictChange(districtValue);
    }
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

  const handleNewFoodImagePicker = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setNewFoodImage(result.assets[0]);
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

        await api.patch(endpoints["current-store"](storeId), formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
      } else if (selectedItem === "address") {
        const validCoordinates = await fetchCoordinates();
        if (!validCoordinates) {
          Alert.alert(
            "Địa chỉ sai hoặc không tồn tại",
            "Bạn có thể nhập địa chỉ đường lớn gần bạn nhất"
          );
          return;
        }

        const formData = new FormData();
        formData.append("address_line", `${houseStreet}, ${ward}, ${district}`);
        formData.append("X", x);
        formData.append("Y", y);

        await api.patch(endpoints["current-store"](storeId), formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
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
          <Text style={[Styles.h1, { textAlign: "left", margin: 10 }]}>
            Địa Chỉ
          </Text>
          <TouchableOpacity onPress={() => handleItemPress("address")}>
            <Text style={[Styles.storename, { margin: 10 }]}>
              {store.address_line}
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <Text style={[Styles.h1, { textAlign: "left", margin: 10 }]}>
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
                  <Text>
                    Trạng thái: {food.active ? "Đang bán" : "Tạm ngưng phục vụ"}
                  </Text>
                  <Text style={Styles.foodrating}>
                    Đánh giá: {food.average_rating}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={handleAddFoodPress}>
            <View style={[Styles.box, AppStyles.flex]}>
              <Text style={Styles.h1}> Thêm Món Ăn</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Overlay
        isVisible={isAddFoodOverlayVisible}
        onBackdropPress={handleCancelAddFood}
        overlayStyle={[Styles.overlay, { width: "100%", height: "100%" }]}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View
            style={{ backgroundColor: "white", padding: 20, borderRadius: 10, flex: 1 }}
          >
            <Text style={Styles.h1}>Thêm 1 món ăn cho cửa hàng</Text>
            <Text style={Styles.overlaySubTitle}>Tên món ăn:</Text>
            <TextInput
              style={Styles.input}
              value={newFoodName}
              onChangeText={setNewFoodName}
            />
            <Text style={Styles.overlaySubTitle}>Hình ảnh:</Text>
            <TouchableOpacity
              onPress={handleNewFoodImagePicker}
              style={[
                Styles.imagePicker,
                { alignItems: "center", justifyContent: "center" },
              ]}
            >
              {newFoodImage ? (
                <Image
                  source={{ uri: newFoodImage.uri }}
                  style={Styles.foodImagePreview}
                />
              ) : (
                <View
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <Ionicons name="image-outline" size={50} color="#999" />
                  <Text style={{ marginTop: 10 }}>Chọn ảnh</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={Styles.overlaySubTitle}>Mô tả (có thể để trống):</Text>
            <TextInput
              style={Styles.input}
              value={newFoodDescription}
              onChangeText={setNewFoodDescription}
              multiline
            />
            <Text style={Styles.overlaySubTitle}>Giá tiền:</Text>
            <TextInput
              style={Styles.input}
              value={newFoodPrice}
              onChangeText={setNewFoodPrice}
              keyboardType="numeric"
            />
            <Text style={Styles.overlaySubTitle}>Danh mục:</Text>
            {categories && categories.length > 0 ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {categories.map((category) => (
                  <Chip
                    key={category.id}
                    onPress={() => handleCategorySelect(category.id.toString())}
                    selected={selectedCategories.includes(
                      category.id.toString()
                    )}
                    style={[
                      Styles.categoryChip,
                      { marginRight: 5, marginBottom: 5 }, // Add margin between chips
                      selectedCategories.includes(category.id.toString()) &&
                        Styles.selectedCategoryChip,
                    ]}
                    mode="outlined"
                  >
                    {selectedCategories.includes(category.id.toString())}
                    {category.name}
                  </Chip>
                ))}
              </View>
            ) : (
              <Text>No categories found.</Text>
            )}
            <Text style={Styles.overlaySubTitle}>Thời gian:</Text>
            {times && times.length > 0 ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {times.map((time) => (
                  <Chip
                    key={time.id}
                    style={[
                      Styles.categoryChip,
                      { marginRight: 5, marginBottom: 5 }, // Add margin between chips
                    ]}
                    mode="outlined"
                  >
                    {time.name}
                  </Chip>
                ))}
              </View>
            ) : (
              <Text>No times found.</Text>
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                margin: 5,
              }}
            >
              <Button
                title="Hủy"
                buttonStyle={{ backgroundColor: "red" }}
                onPress={handleCancelAddFood}
              />
              <Button title="Xác nhận" onPress={handleConfirmAddFood} />
            </View>
          </View>
        </ScrollView>
      </Overlay>
      <Overlay
        isVisible={overlayVisible}
        onBackdropPress={() => setOverlayVisible(false)}
        overlayStyle={Styles.overlay}
      >
        <View style={{ padding: 20 }}>
          <Text style={Styles.overlayTitle}>Chỉnh sửa thông tin</Text>
          {selectedItem === "avatar" && (
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
          )}
          {selectedItem === "name" && (
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
          {selectedItem === "address" && (
            <View>
              <Text style={{ fontWeight: "bold" }}>
                Nhập Quận tại thành phố Hồ Chí Minh:
              </Text>
              <Picker
                selectedValue={district}
                onValueChange={(itemValue) => handleDistrictChange(itemValue)}
                style={Styles.picker}
              >
                <Picker.Item label="Chọn Quận" value="" />
                {data.districts.map((district) => (
                  <Picker.Item
                    key={district.code}
                    label={district.name}
                    value={district.name}
                  />
                ))}
              </Picker>
              <Text style={{ fontWeight: "bold" }}>Nhập Phường/Xã:</Text>
              <Picker
                selectedValue={ward}
                onValueChange={(itemValue) => setWard(itemValue)}
                style={Styles.picker}
                enabled={wards.length > 0}
              >
                <Picker.Item label="Chọn Phường/Xã" value="" />
                {wards.map((ward) => (
                  <Picker.Item
                    key={ward.code}
                    label={ward.name}
                    value={ward.name}
                  />
                ))}
              </Picker>
              <Text style={{ fontWeight: "bold" }}>
                Nhập Số nhà và Tên Đường:
              </Text>
              <TextInput
                style={Styles.input}
                value={houseStreet}
                onChangeText={setHouseStreet}
                onEndEditing={fetchCoordinates}
              />
              <Text style={{ fontWeight: "bold" }}>Địa chỉ:</Text>
              <Text
                style={Styles.address}
              >{`${houseStreet}, ${ward}, ${district}`}</Text>
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
