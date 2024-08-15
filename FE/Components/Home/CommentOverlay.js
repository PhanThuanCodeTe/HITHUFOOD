import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Button, Rating, Overlay } from "@rneui/themed";
import { endpoints, authAPI } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const CommentOverlay = ({ isVisible, onClose, storeId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleAddComment = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const api = authAPI(token);
      const formData = new FormData();
      formData.append("rating", rating);
      formData.append("content", comment);
      console.log("Form Data:", formData);

      await api.post(endpoints["store-comment"](storeId), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      onClose();
      // Optionally, you can reset the rating and comment state after successful submission
      setRating(0);
      setComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    //   Alert.alert("Lỗi", "Bạn đã comment cửa hàng này rồi!");
    }
  };

  return (
    <Overlay isVisible={isVisible} onBackdropPress={onClose}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((value) => (
            <MaterialCommunityIcons
              key={value}
              name={value <= rating ? "star" : "star-outline"}
              size={30}
              color="#FFD700"
              onPress={() => setRating(value)}
            />
          ))}
        </View>
        <View style={styles.commentContainer}>
          <TextInput
            multiline
            placeholder="Bình luận:"
            value={comment}
            onChangeText={setComment}
            style={styles.commentInput}
          />
        </View>
        <Button title="Đăng" onPress={handleAddComment} />
      </SafeAreaView>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentContainer: {
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
  },
});

export default CommentOverlay;
