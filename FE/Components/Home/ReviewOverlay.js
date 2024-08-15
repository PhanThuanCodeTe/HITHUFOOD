import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Overlay, Button } from '@rneui/themed';
import { AirbnbRating } from 'react-native-ratings';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { endpoints, authAPI } from "../../configs/APIs";

const ReviewOverlay = ({ isVisible, onClose, foodId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const api = authAPI(token);

      let formData = new FormData();
      formData.append('food', foodId);
      formData.append('rating', rating);
      formData.append('comment', comment);

      if (image) {
        let localUri = image;
        let filename = localUri.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;
        formData.append('image', { uri: localUri, name: filename, type });
      }

      const response = await api.post(endpoints['review'], formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        onReviewAdded();
        onClose();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <Overlay isVisible={isVisible} onBackdropPress={onClose}>
      <View style={{ width: 300 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Thêm đánh giá</Text>
        <AirbnbRating
          count={5}
          reviews={["Tệ", "Không tốt", "Bình thường", "Tốt", "Tuyệt vời"]}
          defaultRating={0}
          size={20}
          onFinishRating={setRating}
        />
        <TextInput
          placeholder="Nhập đánh giá của bạn"
          value={comment}
          onChangeText={setComment}
          multiline
          style={{ height: 100, borderColor: 'gray', borderWidth: 1, marginTop: 10, padding: 5 }}
        />
        <TouchableOpacity onPress={pickImage} style={{ marginTop: 10 }}>
          <Text>Thêm ảnh (tùy chọn)</Text>
        </TouchableOpacity>
        {image && <Image source={{ uri: image }} style={{ width: 100, height: 100, marginTop: 10 }} />}
        <Button title="Gửi đánh giá" onPress={handleSubmit} containerStyle={{ marginTop: 10 }} />
      </View>
    </Overlay>
  );
};

export default ReviewOverlay;