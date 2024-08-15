import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Linking,
  ImageBackground,
  RefreshControl,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
} from "react-native";
import Styles from "./Styles";
import AppStyles from "../../Styles/AppStyles";
import { Button, Rating, CheckBox } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { endpoints, authAPI } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import CommentOverlay from "./CommentOverlay";

const backGround = require("../../Templates/Images/BackGround.png");

const StoreShow = ({ route }) => {
  const navigation = useNavigation();
  const { storeId } = route.params;
  const [store, setStore] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [toppings, setToppings] = useState([]);
  const [loadingToppings, setLoadingToppings] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [isCommentOverlayVisible, setIsCommentOverlayVisible] = useState(false);
  const [checked, setState] = React.useState(false);


  const fetchStoreAndFoodInfo = async () => {
    try {
      const storeResponse = await axios.get(
        `https://chalf333.pythonanywhere.com/store/${storeId}/`
      );
      setStore(storeResponse.data);
      const foodResponse = await axios.get(
        `https://chalf333.pythonanywhere.com/store/${storeId}/foods/`
      );
      setFoodItems(foodResponse.data);
    } catch (err) {
      console.error("Error fetching store info or food items:", err);
      setError("Failed to load store information. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFollowStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");

      if (!token) {
        return;
      }

      const api = authAPI(token);
      const isFollowedResponse = await api.get(endpoints["is-follow"](storeId));
      setIsFollowed(isFollowedResponse.data);
    } catch (err) {
      console.error("Error fetching follow status:", err);
      setError("Failed to load follow status. Please try again later.");
    }
  };

  const handleFollowtonPress = async () => {
    const token = await AsyncStorage.getItem("accessToken");

    if (!token) {
      Alert.alert("Thông báo", "Bạn cần đăng nhập để theo dõi cửa hàng này");
      return;
    }

    try {
      const api = authAPI(token);
      const response = await api.post(endpoints["follow-store"](storeId));

      if (response.status === 204) {
        Alert.alert("Thông báo", "Đã hủy theo dõi!");
        setIsFollowed(false);
      } else {
        Alert.alert("Thông báo", "Đã theo dõi!");
        setIsFollowed(true);
      }
      fetchStoreAndFoodInfo();
    } catch (err) {
      console.error("Error toggling follow status:", err);
    }
  };

  const handleFoodPress = (food) => {
    navigation.navigate('FoodShown', { foodId: food.id });
  };
  const fetchComments = async () => {
    setCommentLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const api = authAPI(token);
      const response = await api.get(endpoints["store-comment"](storeId));
      setComments(response.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreAndFoodInfo();
    fetchFollowStatus();
    fetchComments();
  }, [storeId]);

  const onFollowButtonPress = () => {
    handleFollowtonPress();
  };

  const Comment = ({ comment }) => (
    <ScrollView style={{ borderWidth: 1, borderColor: "#ccc", maxHeight: 300 }}>
      <View style={Styles.commentBox}>
        <View style={Styles.commentTitle}>
          <Text style={Styles.name}>{comment.name}</Text>
          <Text>
            {comment.rating}
            <MaterialCommunityIcons name={"star"} />
          </Text>
          {/* <Rating
            showRating
            readonly
            startingValue={comment.rating}
            imageSize={20}
            style={{ paddingVertical: 10 }}
          /> */}
        </View>
        <Text>{comment.content}</Text>
      </View>
    </ScrollView>
  );

  const openGoogleMaps = (searchTerm) => {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedSearchTerm}`;
    Linking.openURL(url).catch((err) =>
      console.error("Error opening Google Maps:", err)
    );
  };


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStoreAndFoodInfo();
    fetchComments();
  }, [storeId]);

  if (loading) {
    return (
      <View style={Styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
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


  return (
    <>
      <ImageBackground
        source={backGround}
        style={[Styles.background, Styles.flex]}
      >
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {store && (
            <>
              <View style={Styles.headerContainer}>
                <Image
                  source={{ uri: store.avatar }}
                  style={Styles.storeImage}
                />
                <View style={Styles.storeNameContainer}>
                  <Text style={Styles.storeName}>{store.name}</Text>
                </View>
              </View>
              <Button
                title={isFollowed ? "Bỏ Theo Dõi" : "Theo Dõi"}
                icon={
                  <MaterialCommunityIcons
                    name={isFollowed ? "heart-off" : "heart"}
                    size={20}
                    color="white"
                    style={{ marginRight: 10 }}
                  />
                }
                buttonStyle={{
                  backgroundColor: "red",
                }}
                onPress={onFollowButtonPress}
              />
              <View style={Styles.infoContainer}>
                <Text style={Styles.title}>Địa chỉ cửa hàng:</Text>
                <View style={Styles.addressContainer}>
                  <Text style={Styles.storeAddress}>{store.address_line}</Text>
                  <Button
                    icon={<Icon name="pin-drop" type="material" color="red" size={24}/>}
                    onPress={() => openGoogleMaps(store.address_line)}
                    buttonStyle={Styles.mapButton}
                  />
                </View>
                <Text style={Styles.title}>Mô tả từ cửa hàng:</Text>
                <Text style={Styles.storeDescription}>{store.description}</Text>
                <Text style={Styles.title}>Món ăn</Text>
              </View>
            </>
          )}
          {foodItems.length > 0 ? (
            <View style={Styles.foodContainer}>
              <Text style={Styles.foodTitle}>Đang bán</Text>
              {foodItems.map((food) => (
                <TouchableOpacity
                key={food.id}
                onPress={() => handleFoodPress(food)}
              >
                  <View style={Styles.foodBox}>
                    <View style={Styles.foodInfoContainer}>
                      <Image
                        source={{ uri: food.image }}
                        style={Styles.foodImage}
                      />
                      <View style={Styles.foodDetails}>
                        <Text style={Styles.foodName}>{food.name}</Text>
                        <Text style={Styles.foodPrice}>
                          {formatPrice(food.price)}đ
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={Styles.foodContainer}>
              <Text style={Styles.noFoodText}>
                Cửa hàng chưa đăng món ăn nào
              </Text>
            </View>
          )}
          <View style={Styles.commentSection}>
            <View style={[Styles.commentTitle, { margin: 5 }]}>
              <Text style={Styles.title}>Bình luận</Text>
              <Button
                title="Thêm bình luận"
                onPress={() => setIsCommentOverlayVisible(true)}
              />
            </View>
            {commentLoading ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : comments.length > 0 ? (
              comments.map((comment, index) => (
                <Comment key={index} comment={comment} />
              ))
            ) : (
              <Text style={{ fontWeight: "bold", textAlign: "center" }}>
                Không có bình luận nào.
              </Text>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
      {overlayVisible && selectedFood && (
        <FoodOverlay
          food={selectedFood}
          toppings={toppings}
          loadingToppings={loadingToppings}
          onClose={() => setOverlayVisible(false)}
        />
      )}
      <CommentOverlay
        isVisible={isCommentOverlayVisible}
        onClose={() => setIsCommentOverlayVisible(false)}
        storeId={storeId}
      />
    </>
  );
};

const formatPrice = (price) => {
  const priceString = price.toString();
  const formattedPrice = priceString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return formattedPrice;
};

export default StoreShow;
