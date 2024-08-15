import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ImageBackground,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import Styles from "./Styles";
import { Button, Overlay } from "@rneui/themed";
import { useNavigation, useRoute } from "@react-navigation/native";
import APIs, { endpoints, authAPI } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { GEOCODING_APIKEY } from "@env";
import { Picker } from "@react-native-picker/picker";

const backGround = require("../../Templates/Images/BackGround.png");
const data = require("../../data.json");

const UserInfo = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userInfo, fetchUserInfo, setAccessToken, setUserInfo } = route.params;

  const [token, setToken] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [fieldToChange, setFieldToChange] = useState(null);
  const [newInfo, setNewInfo] = useState("");
  const [newAvatar, setNewAvatar] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [houseStreet, setHouseStreet] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [wards, setWards] = useState([]);
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [addressId, setAddressId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [updatedUserInfo, setUpdatedUserInfo] = useState(userInfo);


  useEffect(() => {
    if (!userInfo) {
      console.error("UserInfo is undefined");
      navigation.navigate("User");
    }
  }, [userInfo]);

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener("focus", () => {
  //     navigation.setOptions({
  //       headerRight: () => (
  //         <Button
  //           title="Logout"
  //           onPress={handleLogout}
  //           buttonStyle={{ backgroundColor: "red" }}
  //         />
  //       ),
  //     });
  //   });

  //   return unsubscribe;
  // }, [navigation, handleLogout]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("expirationTime");
    await AsyncStorage.removeItem("refreshToken");
    setAccessToken(null);
    setUserInfo(null);
    navigation.navigate("UserProfile");
  };

  useEffect(() => {
    const fetchUpdatedUserInfo = async () => {
      const updatedInfo = await updateUserInfo();
      setUpdatedUserInfo(updatedInfo);
    };

    fetchUpdatedUserInfo();
  }, [updateUserInfo]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("accessToken");
        setToken(storedToken);
      } catch (error) {
        console.error("Error retrieving token from AsyncStorage:", error);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchAddresses(token);
    }
  }, [token]);

  const fetchAddresses = async (token) => {
    try {
      const response = await authAPI(token).get(
        endpoints["current-user-address"],
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAddresses(response.data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };
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
        return true; // Valid coordinates
      } else {
        return false; // No valid coordinates
      }
    } catch (error) {
      console.error("Error fetching geocode data:", error);
      return false; // Error fetching data
    }
  };
  const {
    last_name,
    first_name,
    avatar,
    gender,
    email,
    phone_number,
    is_store_owner,
    store,
  } = userInfo;

  const handleStoreNavigation = () => {
    if (store) {
      navigation.navigate("Store", { storeId: store });
    } else {
      navigation.navigate("StoreCreate");
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có muốn đăng xuất?",
      [
        { text: "Không", style: "cancel" },
        { text: "Có", onPress: handleLogout },
      ],
      { cancelable: false }
    );
  };

  const handleOverlayOpen = (field, address) => {
    setFieldToChange(field);
    setOverlayVisible(true);
    if (address) {
      setHouseStreet(address.address_line.split(',')[0].trim());
      setWard(address.address_line.split(',')[1].trim());
      setDistrict(address.address_line.split(',')[2].trim());
      setAddressId(address.id); // Store the address id
      setSelectedAddress(address.address_line); // Set the selected address
    } else {
      setHouseStreet('');
      setWard('');
      setDistrict('');
      setAddressId(null); // Clear the address id
      setSelectedAddress(null); // Clear the selected address
    }
  };
  

  const handleOverlayClose = () => {
    setOverlayVisible(false);
    setFieldToChange(null);
    setNewInfo("");
    setNewAvatar(null);
  };

  const handleImagePicker = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setNewAvatar(result.assets[0]);
    }
  };

  const updateUserInfo = async (key, value) => {
    try {
      const formData = new FormData();
      const adjustedKey = key === "phone" ? "phone_number" : key;

      if (key === "avatar") {
        formData.append(adjustedKey, {
          uri: value.uri,
          type: "image/jpeg",
          name: "avatar.jpg",
        });
      } else {
        formData.append(adjustedKey, value);
      }
      const response = await authAPI(token).patch(
        endpoints["current-user"],
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOverlayVisible(false);
      setNewInfo("");
      setNewAvatar(null);
      await fetchUserInfo(token);
    } catch (error) {
      // console.error("Update User Info Error:", error);
    }
  };

  const handleSubmitAddress = async () => {
    try {
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

      const response = await authAPI(token).post(
        endpoints["current-user-address"],
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Thành công", "Địa chỉ mới đã được thêm thành công.");
      handleOverlayClose();
      await fetchAddresses(token);
    } catch (error) {
      console.error("Error adding new address:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi thêm địa chỉ mới.");
    }
  };

  const handleDeleteAddress = async () => {
    try {
      if (addressId) {
        await authAPI(token).delete(endpoints['change-address'](addressId), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
    
        Alert.alert('Thành công', 'Địa chỉ đã được xóa thành công.');
        handleOverlayClose();
        await fetchAddresses(token);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy địa chỉ này trong hệ thống.');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi xóa địa chỉ.');
    }
  };
  

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchUserInfo(token);
      await fetchAddresses(token);
    } catch (error) {
      console.error("Refresh Error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setRefreshing(true);
      Alert.alert(
        "Lưu thay đổi",
        "Bạn có muốn lưu những thay đổi này?",
        [
          { text: "Không", onPress: handleOverlayClose, style: "cancel" },
          {
            text: "Lưu",
            onPress: async () => {
              if (fieldToChange === "avatar") {
                await updateUserInfo("avatar", newAvatar);
              } else if (fieldToChange === "address") {
                if (addressId) {
                  // Update existing address
                  await handlePatchAddress();
                } else {
                  // Create new address
                  await handleSubmitAddress();
                }
              } else {
                await updateUserInfo(fieldToChange, newInfo);
              }
              handleOverlayClose();
              await fetchAddresses(token);
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Save Changes Error:", error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const handlePatchAddress = async () => {
    try {
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
  
      await authAPI(token).patch(endpoints['change-address'](addressId), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      Alert.alert("Thành công", "Địa chỉ đã được cập nhật thành công.");
    } catch (error) {
      console.error("Error updating address:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi cập nhật địa chỉ.");
    }
  };
  

  const renderOverlayContent = () => {
    if (fieldToChange === "avatar") {
      return (
        <View>
          <Text style={Styles.overlayTitle}>Thay đổi ảnh đại diện</Text>
          <Text style={Styles.overlaySubTitle}>Ảnh đại diện cũ:</Text>
          <View style={Styles.avatarContainer}>
            <Image source={{ uri: avatar }} style={Styles.overlayavatar} />
          </View>
          <Text style={Styles.overlaySubTitle}>Ảnh đại diện mới:</Text>
          <TouchableOpacity
            onPress={handleImagePicker}
            style={[Styles.imagePicker, newAvatar && { borderWidth: 0 }]}
          >
            {newAvatar ? (
              <Image source={{ uri: newAvatar.uri }} style={Styles.avatar} />
            ) : (
              <Text>Chọn ảnh</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    } else if (fieldToChange === "address") {
      return (
        <View>
          <Text style={Styles.overlayTitle}>{houseStreet ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</Text>
          {selectedAddress && (
            <Text style={Styles.addressText}>{`Địa chỉ đã chọn: ${selectedAddress}`}</Text>
          )}
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
          <Text style={{ fontWeight: "bold" }}>Nhập Số nhà và Tên Đường:</Text>
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
          {addressId !== null && (<Button
            title="Xóa địa chỉ"
            buttonStyle={[Styles.Button, { backgroundColor: 'red', marginTop: 20 }]}
            titleStyle={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}
            onPress={() => Alert.alert(
              "Cảnh báo",
              "Bạn chắc chắn xóa địa chỉ này chứ?",
              [
                {
                  text: "Không",
                  onPress: () => {},
                  style: "cancel"
                },
                { text: "Xóa", onPress: handleDeleteAddress }
              ],
              { cancelable: false }
            )}
          />)}         
        </View>
        
      );
    } else {
      const currentInfo =
        fieldToChange === "phone_number" ? phone_number : email;
      return (
        <View>
          <Text style={Styles.overlayTitle}>Thay đổi thông tin cá nhân</Text>
          <Text style={Styles.overlaySubTitle}>
            {fieldToChange === "phone_number"
              ? "Số điện thoại cũ:"
              : "Email cũ:"}
          </Text>
          <Text style={Styles.overlayinfo}>{currentInfo}</Text>
          <Text style={Styles.overlaySubTitle}>
            {fieldToChange === "phone_number"
              ? "Số điện thoại mới:"
              : "Email mới:"}
          </Text>
          <TextInput
            value={newInfo}
            onChangeText={setNewInfo}
            style={Styles.input}
          />
        </View>
      );
    }
  };
  

  return (
    <ImageBackground source={backGround} style={Styles.background}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={Styles.userInfoContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => handleOverlayOpen("avatar")}>
              <View style={Styles.avatar}>
                <Image source={{ uri: avatar }} style={Styles.avatar} />
              </View>
            </TouchableOpacity>
            <Text style={Styles.greeting}>
              Chào {last_name} {first_name}
            </Text>
          </View>
          <Text style={Styles.text}>Thông tin cá nhân</Text>
          <View style={Styles.infoBox}>
            <View style={Styles.infoRow}>
              <Text>Giới tính: </Text>
              <Text>{gender}</Text>
            </View>
          </View>
          <View style={Styles.infoBox}>
            <View style={Styles.infoRow}>
              <Text>Email: </Text>
              <Text>{email}</Text>
            </View>
            <TouchableOpacity
              style={Styles.changeButton}
              onPress={() => handleOverlayOpen("email")}
            >
              <Text>Thay đổi</Text>
            </TouchableOpacity>
          </View>
          <View style={Styles.infoBox}>
            <View style={Styles.infoRow}>
              <Text>Số điện thoại: </Text>
              <Text>{phone_number}</Text>
            </View>
            <TouchableOpacity
              style={Styles.changeButton}
              onPress={() => handleOverlayOpen("phone_number")}
            >
              <Text>Thay đổi</Text>
            </TouchableOpacity>
          </View>
          <View style={Styles.infoBox}>
            <View style={Styles.infoRow}>
              <Text>Cửa hàng của tôi </Text>
            </View>
            <TouchableOpacity
              style={Styles.changeButton}
              onPress={handleStoreNavigation}
            >
              <Text>Xem</Text>
            </TouchableOpacity>
          </View>

          <View style={Styles.addressContainer}>
            <Text style={Styles.title}>Địa chỉ của tôi</Text>
            {addresses.map((address, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  {
                    margin: 5,
                    borderWidth: 1,
                    borderColor: "gray",
                    padding: 10,
                  },
                  Styles.addressContainer,
                ]}
                onPress={() => handleOverlayOpen("address", address)}
              >
                <Text style={Styles.addressText}>{address.address_line}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => handleOverlayOpen("address", null)}
              style={Styles.addAddressButton}
            >
              <Text style={Styles.changeButton}>Thêm một địa chỉ mới</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Đăng xuất"
            buttonStyle={[Styles.Button, { margin: 10 }]}
            titleStyle={{ color: "white", fontWeight: "bold", fontSize: 18 }}
            onPress={confirmLogout}
          />
          <Overlay
            isVisible={overlayVisible}
            onBackdropPress={handleOverlayClose}
            overlayStyle={Styles.overlay}
          >
            {renderOverlayContent()}
            <Button
              title="Lưu"
              buttonStyle={[Styles.Button, { marginTop: 20 }]}
              titleStyle={{ color: "white", fontWeight: "bold", fontSize: 18 }}
              onPress={handleSaveChanges}
            />
          </Overlay>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default UserInfo;
