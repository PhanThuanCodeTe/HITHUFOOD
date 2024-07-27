import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Button, CheckBox, ListItem } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { endpoints, authAPI } from "../../configs/APIs";
import Styles from "./Styles";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { AirbnbRating } from "react-native-ratings";
import ReviewOverlay from "./ReviewOverlay";

const FoodShown = ({ route }) => {
  const navigation = useNavigation();
  const { foodId } = route.params;
  const [food, setFood] = useState(null);
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [toppingChecked, setToppingChecked] = useState({});
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isReviewOverlayVisible, setIsReviewOverlayVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFoodAndToppings();
  }, [foodId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFoodAndToppings().finally(() => setRefreshing(false));
  };

  const fetchFoodAndToppings = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const api = authAPI(token);
      const [foodResponse, toppingsResponse] = await Promise.all([
        api.get(endpoints["food-info"](foodId)),
        api.get(endpoints["food-topping"](foodId)),
      ]);

      setFood(foodResponse.data);
      setToppings(toppingsResponse.data);
    } catch (error) {
      console.error("Error fetching food and toppings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (page = 1) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const api = authAPI(token);
      const response = await api.get(endpoints["show-review"](foodId, page));

      if (Array.isArray(response.data)) {
        if (page === 1) {
          setReviews(response.data);
        } else {
          setReviews((prevReviews) => [...prevReviews, ...response.data]);
        }

        // Assuming you want to load more reviews if you received any
        setHasMoreReviews(response.data.length > 0);
        setCurrentPage(page);
      } else {
        console.error("Unexpected response format:", response.data);
        setReviews([]);
        setHasMoreReviews(false);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
      setHasMoreReviews(false);
    }
  };

  useEffect(() => {
    if (isReviewsExpanded) {
      fetchReviews();
    }
  }, [isReviewsExpanded]);

  const incrementQuantity = () => setQuantity(quantity + 1);
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddReview = () => {
    setIsReviewOverlayVisible(true);
  };

  const handleReviewAdded = () => {
    fetchReviews();
    setIsReviewOverlayVisible(false);
  };

  const handleOrder = () => {
    const selectedToppings = Object.entries(toppingChecked)
      .filter(([id, isChecked]) => isChecked)
      .map(([id]) => toppings.find((topping) => topping.id.toString() === id));
    console.log("Sllllll: ", quantity);
    const orderItem = {
      food: {
        id: food.id,
        name: food.name,
        price: food.price,
        image: food.image,
        store: food.store,
      },
      quantity: quantity,
      toppings: selectedToppings,
      totalPrice:
        (food.price +
          selectedToppings.reduce((sum, topping) => sum + topping.price, 0)) *
        quantity,
    };

    console.log("Data sent: ", orderItem);
    console.log("food.store: ", food.store);

    navigation.navigate("Order", { newOrderItem: orderItem });
  };

  if (loading) {
    return (
      <View style={Styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Render food details only when food state is not null
  if (!food) {
    return (
      <View style={Styles.centered}>
        <Text>Không tìm thấy món ăn!</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={Styles.overlayContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Image source={{ uri: food.image }} style={Styles.overlayImage1} />
        <View>
        <Text style={Styles.overlayFoodName}>{food.name}</Text>
        <View>
        <AirbnbRating
          count={5}
          defaultRating={Math.round(food.average_rating)}
          size={20}
          showRating={false}
          isDisabled={true}
        />
        </View>
        </View>
        <Text style={Styles.title}>Mô tả</Text>
        <Text style={Styles.overlayDescription}>{food.description}</Text>
        <Text style={Styles.overlayPrice}>{formatPrice(food.price)}đ</Text>

        <Text style={Styles.title}>Toppings:</Text>
        {toppings.length > 0 ? (
          toppings.map((topping) => (
            <View key={topping.id} style={Styles.overlayToppingRow}>
              <Text>{topping.name}</Text>
              <View style={Styles.toppingPriceContainer}>
                <Text>{formatPrice(topping.price)}đ</Text>
                <CheckBox
                  checkedIcon={
                    <MaterialCommunityIcons
                      name="check"
                      size={24}
                      color="green"
                    />
                  }
                  uncheckedIcon={
                    <MaterialCommunityIcons
                      name="plus"
                      size={24}
                      color="green"
                    />
                  }
                  checked={toppingChecked[topping.id] || false}
                  onPress={() =>
                    setToppingChecked((prev) => ({
                      ...prev,
                      [topping.id]: !prev[topping.id],
                    }))
                  }
                />
              </View>
            </View>
          ))
        ) : (
          <Text style={{ fontWeight: "bold", textAlign: "center" }}>
            Món này không có topping
          </Text>
        )}

        <View style={Styles.quantityContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={Styles.quantityLabel}>Số lượng:</Text>
            <View style={Styles.quantityButtonGroup}>
              <TouchableOpacity
                onPress={decrementQuantity}
                style={Styles.quantityButton}
              >
                <MaterialCommunityIcons name="minus" size={20} color="black" />
              </TouchableOpacity>
              <Text style={Styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                onPress={incrementQuantity}
                style={Styles.quantityButton}
              >
                <MaterialCommunityIcons name="plus" size={20} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          <Button
            radius="sm"
            type="solid"
            buttonStyle={{
              backgroundColor: "#60D160",
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}
            title="Đặt hàng"
            containerStyle={Styles.orderButtonContainer}
            icon={
              <MaterialCommunityIcons
                name="cart"
                size={20}
                color="white"
                style={{ marginLeft: 10 }}
              />
            }
            iconRight
            onPress={() => handleOrder()}
            titleStyle={{ marginRight: 10, color: "white" }}
          />
        </View>

        <ListItem.Accordion
          onPress={() => setIsReviewsExpanded(!isReviewsExpanded)}
          content={
            <ListItem.Content>
              <ListItem.Title>Đánh giá</ListItem.Title>
            </ListItem.Content>
          }
          isExpanded={isReviewsExpanded}
        >
          <ListItem onPress={handleAddReview}>
            <ListItem.Content>
              <ListItem.Title>
                <TouchableOpacity onPress={handleAddReview}>
                  <Text>Thêm đánh giá cho món ăn này</Text>
                </TouchableOpacity>
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>
          {Array.isArray(reviews) && reviews.length > 0 ? (
            reviews.map((review, index) => (
              <ListItem key={index}>
                <ListItem.Content>
                  <ListItem.Title>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={Styles.reviewname}>{review.user_name}</Text>
                      <View>
                        <AirbnbRating
                          count={5}
                          defaultRating={Math.round(review.rating)}
                          size={20}
                          showRating={false}
                          isDisabled={true}
                        />
                      </View>
                    </View>
                  </ListItem.Title>
                  <Text>{review.comment}</Text>
                  {review.image && (
                    <TouchableOpacity
                      onPress={() => setSelectedImage(review.image)}
                    >
                      <View style={Styles.reviewImage}>
                        <Image
                          source={{ uri: review.image }}
                          style={{ width: "100%", height: "100%" }}
                        />
                        <LinearGradient
                          colors={["transparent", "rgba(0,0,0,0.5)"]}
                          style={Styles.reviewImageGradient}
                        />
                      </View>
                    </TouchableOpacity>
                  )}
                </ListItem.Content>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItem.Content>
                <Text>Không có đánh giá nào.</Text>
              </ListItem.Content>
            </ListItem>
          )}
          {hasMoreReviews && (
            <Button
              title="Xem thêm Đánh giá"
              onPress={() => fetchReviews(currentPage + 1)}
            />
          )}
        </ListItem.Accordion>
      </ScrollView>
      {selectedImage && (
        <TouchableOpacity
          style={Styles.fullScreenImageOverlay}
          onPress={() => setSelectedImage(null)}
        >
          <Image
            source={{ uri: selectedImage }}
            style={Styles.fullScreenImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
      <ReviewOverlay
        isVisible={isReviewOverlayVisible}
        onClose={() => setIsReviewOverlayVisible(false)}
        foodId={foodId}
        onReviewAdded={handleReviewAdded}
      />
    </View>
  );
};

const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default FoodShown;
