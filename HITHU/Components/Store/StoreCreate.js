import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, Image, ImageBackground, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; 
import { authAPI, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Styles from './Styles';
import { GEOCODING_APIKEY } from "@env";
import { Button } from '@rneui/themed';

const backGround = require('../../Templates/Images/BackGround.png');
const data = require('../../data.json');

const StoreCreate = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [address, setAddress] = useState('');
  const [houseStreet, setHouseStreet] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [hasStore, setHasStore] = useState(false);
  const [wards, setWards] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    checkUserStore();
  }, []);

  const checkUserStore = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    try {
      const api = authAPI(token);
      const response = await api.get(endpoints['current-user']);
      const userData = response.data;
      if (userData && userData.store) {
        setHasStore(true);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchCoordinates = async () => {
    const formattedAddress = formatAddress(`${houseStreet}, ${ward}, ${district}`);
    const apiUrl = `https://geocode.maps.co/search?q=${formattedAddress}&api_key=${GEOCODING_APIKEY}`;
    try {
      const response = await fetch(apiUrl);
      const text = await response.text();
      console.log("Geocoding API response:", text);
      const data = JSON.parse(text);
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setX(lat.toString());
        setY(lon.toString());
        return true;  // Valid coordinates
      } else {
        return false;  // No valid coordinates
      }
    } catch (error) {
      console.error("Error fetching geocode data:", error);
      return false;  // Error fetching data
    }
  };

  const handleImagePicker = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setAvatar(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!avatar) {  
      Alert.alert('Please select an avatar');
      return;
    }

    const validCoordinates = await fetchCoordinates();
    if (!validCoordinates) {
      Alert.alert('Địa chỉ sai hoặc không tồn tại', 'Bạn có thể nhập địa chỉ đường lớn gần bạn nhất');
      return;
    }

    const token = await AsyncStorage.getItem('accessToken');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('avatar', {
        uri: avatar.uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      });
      formData.append('address_line', `${houseStreet}, ${ward}, ${district}`);
      formData.append('X', x);
      formData.append('Y', y);

      console.log('FormData:', formData);

      const api = authAPI(token);
      const response = await api.post(endpoints['store-create'], formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Fetch updated user info
      const updateUserInfo = async () => {
        try {
          const token = await AsyncStorage.getItem('accessToken');
          const api = authAPI(token);
          const response = await api.get(endpoints['current-user']);
          return response.data;
        } catch (error) {
          console.error('Error updating user info:', error);
          return null;
        }
      };

      Alert.alert(
        'Đã gửi lên quản trị viên chờ được xác nhận',
        'Thời gian có thể kéo dài từ 3 - 7 ngày',
        [{ 
          text: 'OK', 
          onPress: () => navigation.navigate('UserInfo', { userInfo: null, updateUserInfo }) 
        }]
      );
      
    } catch (error) {
      console.error('Store Creation Error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau.');
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

  const handleDistrictChange = (district) => {
    setDistrict(district);
    const selectedDistrict = data.districts.find(d => d.name === district);
    if (selectedDistrict) {
      setWards(selectedDistrict.wards);
    } else {
      setWards([]);
    }
    setWard('');
  };

  return (
    <ImageBackground source={backGround} style={Styles.background}>
      <ScrollView>
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
            <View key={index} style={[Styles.box, AppStyles.flex]}>
              <TouchableOpacity>
                <Image style={Styles.foodimage} source={{ uri: food.image }} />
              </TouchableOpacity>
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
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default StoreCreate;

// 2 lan