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

  const fetchUpdatedUserInfo = async () => {
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
      const updatedUserInfo = await fetchUpdatedUserInfo();
      if (updatedUserInfo) {
        Alert.alert(
          'Đã gửi lên quản trị viên chờ được xác nhận',
          'Thời gian có thể kéo dài từ 3 - 7 ngày',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('UserInfo', { userInfo: updatedUserInfo, handleLogout, fetchUserInfo }),
            },
          ]
        );
      } else {
        Alert.alert('Lỗi', 'Đã xảy ra lỗi khi lấy thông tin người dùng mới nhất.');
      }
    } catch {
      console.error("You have error: ",error);
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
        {hasStore ? (
          <View style={Styles.contentshow}>
            <Text style={Styles.message}>Bạn đã có 1 cửa hàng và đang chờ được duyệt từ quản trị viên</Text>
          </View>
        ) : (
          <>
            <Text style={Styles.title}>Tên cửa hàng:</Text>
            <TextInput style={Styles.input} value={name} onChangeText={setName} />

            <Text style={Styles.title}>Mô tả chi tiết cửa hàng:</Text>
            <TextInput style={Styles.input} value={description} onChangeText={setDescription} />

            <Text style={Styles.title}>Ảnh đại diện cửa hàng:</Text>
            <TouchableOpacity onPress={handleImagePicker}
            style={[Styles.imagePicker, avatar && { borderWidth: 0 }]}>
              {avatar ? <Image source={{ uri: avatar.uri }} style={Styles.avatar} /> : <Text>Chọn ảnh</Text>}
            </TouchableOpacity>

            <Text style={Styles.title}>Nhập Quận tại thành phố Hồ Chí Minh:</Text>
            <Picker
              selectedValue={district}
              onValueChange={(itemValue) => handleDistrictChange(itemValue)}
              style={Styles.picker}
            >
              <Picker.Item label="Chọn Quận" value="" />
              {data.districts.map((district) => (
                <Picker.Item key={district.code} label={district.name} value={district.name} />
              ))}
            </Picker>

            <Text style={Styles.title}>Nhập Phường/Xã:</Text>
            <Picker
              selectedValue={ward}
              onValueChange={(itemValue) => setWard(itemValue)}
              style={Styles.picker}
              enabled={wards.length > 0}
            >
              <Picker.Item label="Chọn Phường/Xã" value="" />
              {wards.map((ward) => (
                <Picker.Item key={ward.code} label={ward.name} value={ward.name} />
              ))}
            </Picker>

            <Text style={Styles.title}>Nhập Số nhà và Tên Đường:</Text>
            <TextInput 
              style={Styles.input} 
              value={houseStreet} 
              onChangeText={setHouseStreet}
              onEndEditing={fetchCoordinates}
            />

            <Text style={Styles.title}>Địa chỉ:</Text>
            <Text style={Styles.address}>{`${houseStreet}, ${ward}, ${district}`}</Text>

            <Button buttonStyle={Styles.sendbutton} title="Gửi" onPress={handleSubmit} />
          </>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

export default StoreCreate;

// 2 lan