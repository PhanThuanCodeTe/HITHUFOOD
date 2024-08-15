import React from 'react';
import { TouchableOpacity, Text, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const ImagePickerComponent = ({ avatar, setAvatar }) => {
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

  return (
    <TouchableOpacity onPress={handleImagePicker} style={Styles.imagePicker}>
      {avatar ? <Image source={{ uri: avatar.uri }} style={Styles.avatar} /> : <Text>Chọn ảnh</Text>}
    </TouchableOpacity>
  );
};

export default ImagePickerComponent;