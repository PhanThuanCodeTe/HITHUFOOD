import React, { useContext, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OrderContext } from "../OrderContext/OrderContext";
import { Button } from "react-native-elements";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import Styles from "./Styles";
import { GEOCODING_APIKEY } from "@env";
import { useRoute } from "@react-navigation/native";
import { ListItem } from "@rneui/themed";
import axios from "axios";
import { endpoints, authAPI } from "../../configs/APIs";

const backGround = require("../../Templates/Images/BackGround.png");
const SHIPPING_RATE = 5000;

const Order = ({ navigation }) => {
  const route = useRoute();
  // const {
  //   orderItems,
  //   addToOrder,
  //   removeFromOrder,
  // } = useContext(OrderContext);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null); // State to track the expanded item
  const previousOrderItem = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track user login status
  const [storeInfo, setStoreInfo] = useState(null); // State to store store information
  const [userAddress, setUserAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(
    "Chọn 1 địa chỉ giao hàng"
  );
  const [userAddresses, setUserAddresses] = useState([]);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [storeCoordinates, setStoreCoordinates] = useState(null);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const [selectedAddressCoordinates, setSelectedAddressCoordinates] =
    useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    resetStoreInfo(); // Reset the storeInfo state
    try {
      await fetchUserAddress();
      if (orderItems.length > 0) {
        await fetchStoreInfo(orderItems[0].food.store);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [orderItems]);

  const addToOrder = (item) => {
    setOrderItems([...orderItems, item]);
  };

  const removeFromOrder = (index) => {
    Alert.alert(
      "Xác nhận",
      "Bạn muốn xóa món này ra khỏi đơn hàng?",
      [
        {
          text: "Không",
          style: "cancel",
        },
        {
          text: "Xóa",
          onPress: () => {
            const newOrderItems = [...orderItems];
            newOrderItems.splice(index, 1);
            setOrderItems(newOrderItems);
          },
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    // Reset the necessary states when the user has logged out
    if (hasLoggedOut) {
      setOrderItems([]);
      setUserAddresses([]);
      setSelectedAddress("Chọn 1 địa chỉ giao hàng");
      setStoreInfo(null);
      setHasLoggedOut(false);
    }
  }, [hasLoggedOut]);

  useEffect(() => {
    // Check user login status from AsyncStorage
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const isLoggedIn = !!token;
        setIsLoggedIn(isLoggedIn);

        // If the user is not logged in, reset the necessary states
        if (!isLoggedIn) {
          setOrderItems([]);
          setUserAddresses([]);
          setSelectedAddress("Chọn 1 địa chỉ giao hàng");
          setStoreInfo(null);
          setHasLoggedOut(true);
        }
      } catch (error) {
        console.error("Error reading user token from AsyncStorage:", error);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    fetchUserAddress();
  }, []); // This will run once when the component mounts

  const fetchUserAddress = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.log("No access token found. User might not be logged in.");
        setUserAddresses([]); // Reset the userAddresses if the user is not logged in
        return;
      }

      const api = authAPI(token);
      const response = await api.get(endpoints["current-user-address"]);
      setUserAddresses(response.data);
      console.log("User addresses:", response.data);
    } catch (error) {
      console.error("Error fetching user addresses:", error);
    }
  };

  useEffect(() => {
    if (storeInfo) {
      setStoreCoordinates({
        Y: parseFloat(storeInfo.Y),
        X: parseFloat(storeInfo.X),
      });
    }
  }, [storeInfo]);

  useEffect(() => {
    if (storeCoordinates && selectedAddressCoordinates) {
      const distance = calculateDistance(
        storeCoordinates,
        selectedAddressCoordinates
      );
      const fee = Math.round(distance * SHIPPING_RATE);
      setShippingFee(fee);
    }
  }, [storeCoordinates, selectedAddressCoordinates]);

  const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(coord2.Y - coord1.Y);
    const dLon = toRad(coord2.X - coord1.X);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(coord1.Y)) *
        Math.cos(toRad(coord2.Y)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance; // Distance in km
  };

  const toRad = (value) => {
    return (value * Math.PI) / 180;
  };

  const AddressSelection = ({ addresses, selectedAddress, onSelect }) => (
    <ListItem.Accordion
      content={
        <ListItem.Content>
          <ListItem.Title style={Styles.addressSelectionTitle}>
            Giao đến:
          </ListItem.Title>
          <ListItem.Subtitle>{selectedAddress}</ListItem.Subtitle>
        </ListItem.Content>
      }
      isExpanded={isAddressExpanded}
      onPress={() => {
        setIsAddressExpanded(!isAddressExpanded);
        fetchUserAddress();
        if (!userAddresses.length) {
          Alert.alert(
            "Cảnh báo",
            "Bạn cần thêm địa chỉ ở mục quản lý tài khoản"
          );
        }
      }}
    >
      {addresses.map((address, index) => (
        <ListItem
          key={index}
          onPress={() => {
            onSelect(address.address_line);
            setSelectedAddressCoordinates({
              Y: parseFloat(address.Y),
              X: parseFloat(address.X),
            });
          }}
        >
          <ListItem.Content>
            <ListItem.Title>{address.address_line}</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      ))}
    </ListItem.Accordion>
  );

  useEffect(() => {
    const newOrderItem = route.params?.newOrderItem;
    if (newOrderItem && newOrderItem !== previousOrderItem.current) {
      if (storeInfo && newOrderItem.food.store !== storeInfo.id) {
        Alert.alert("Cảnh báo", "Một đơn hàng chỉ mua được từ 1 cửa hàng");
        return;
      }
      console.log("New order item food.store: ", newOrderItem.food.store);
      addToOrder(newOrderItem);
      previousOrderItem.current = newOrderItem;
      fetchStoreInfo(newOrderItem.food.store);
    }
  }, [route.params?.newOrderItem]);

  useEffect(() => {
    const layoutHeight = 600;
    const contentHeight = orderItems.length * 100;
    setIsScrollable(layoutHeight < contentHeight);
    setIsAtBottom(layoutHeight >= contentHeight);
  }, [orderItems]);

  useEffect(() => {
    // Check user login status from AsyncStorage
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        setIsLoggedIn(!!token); // Set isLoggedIn to true if token exists
      } catch (error) {
        console.error("Error reading user token from AsyncStorage:", error);
      }
    };

    checkLoginStatus();
  }, []);

  const fetchStoreInfo = async (storeId) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const api = authAPI(token);
      const response = await api.get(endpoints["current-store"](storeId));
      setStoreInfo(response.data);
      console.log("Store information:", response.data);
    } catch (error) {
      console.error("Error fetching store information:", error);
    }
  };

  const resetStoreInfo = () => {
    setStoreInfo(null);
    setStoreCoordinates(null);
    setShippingFee(0);
  };

  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    setIsAtBottom(isBottom);
    setIsScrollable(layoutMeasurement.height < contentSize.height);
  };

  const handleCheckoutPress = async () => {
    if (!isLoggedIn) {
      Alert.alert("Thông báo", "Bạn phải đăng nhập mới có thể tiếp tục");
      return;
    }

    if (!userAddresses.length) {
      Alert.alert("Cảnh báo", "Bạn cần thêm địa chỉ ở mục quản lý tài khoản");
      return;
    }

    const selectedAddressObj = userAddresses.find(addr => addr.address_line === selectedAddress);
    if (!selectedAddressObj) {
      Alert.alert("Cảnh báo", "Vui lòng chọn một địa chỉ giao hàng");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("accessToken");
      const api = authAPI(token);

      const orderData = {
        store: storeInfo.id,
        shipping_fee: shippingFee,
        address: selectedAddressObj.id,
        items: orderItems.map((item) => {
          const orderItemToppings =
            item.toppings.length > 0
              ? item.toppings.map((topping) => ({
                  topping: topping.id,
                }))
              : []; // Set to an empty array if no toppings are selected

          return {
            food: item.food.id,
            quantity: item.quantity,
            order_item_topping: orderItemToppings,
          };
        }),
      };

      console.log(
        "Data being sent to server:",
        JSON.stringify(orderData, null, 2)
      );

      const response = await api.post("/order/", orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Order placed successfully:", response.data);
      Alert.alert("Đặt hàng", "Đơn hàng của bạn đã được đặt thành công!");
      setOrderItems([]); // Reset the orderItems using the function from OrderContext
      // Reset the order or perform any other necessary actions
      navigation.navigate(route.name); // Refresh the page by navigating to the current route
    } catch (error) {
      // console.error("Error placing order:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi đặt đơn hàng.");
    }
  };

  const calculateTotalPrice = () => {
    const totalItemPrice = orderItems.reduce(
      (total, item) =>
        total +
        item.food.price * item.quantity +
        item.toppings.reduce((sum, topping) => sum + topping.price, 0) *
          item.quantity,
      0
    );
    return totalItemPrice + shippingFee; // Use the calculated shippingFee
  };

  return (
    <ImageBackground source={backGround} style={Styles.background}>
      <ScrollView
        contentContainerStyle={Styles.scrollViewContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={Styles.addressInfoContainer}>
          <Text>
            <Text style={Styles.addressInfoText}>Giao Từ: </Text>
            {storeInfo ? storeInfo.address_line : "Loading..."}
          </Text>
          <AddressSelection
            addresses={userAddresses}
            selectedAddress={selectedAddress}
            onSelect={(address) => {
              setSelectedAddress(address);
              setIsAddressExpanded(false);
            }}
          />
        </View>

        <View style={Styles.container}>
          {orderItems.length > 0 ? (
            orderItems.map((item, index) => (
              <ListItem.Accordion
                key={index}
                content={
                  <>
                    <ListItem.Content>
                      <ListItem.Title style={Styles.LITitle}>
                        {item.food.name}
                      </ListItem.Title>
                      <ListItem.Subtitle style={Styles.LISubTitle}>
                        Số lượng: {item.quantity}
                      </ListItem.Subtitle>
                    </ListItem.Content>
                  </>
                }
                isExpanded={expandedIndex === index}
                onPress={() => {
                  setExpandedIndex(expandedIndex === index ? null : index);
                }}
              >
                {item.toppings.map((topping, toppingIndex) => (
                  <ListItem key={toppingIndex} bottomDivider>
                    <ListItem.Content style={Styles.toppinglist}>
                      <ListItem.Title>{topping.name}</ListItem.Title>
                      <ListItem.Subtitle style={{ fontWeight: "bold" }}>
                        {formatPrice(topping.price)}đ
                      </ListItem.Subtitle>
                    </ListItem.Content>
                  </ListItem>
                ))}
                <ListItem bottomDivider>
                  <ListItem.Content>
                    <ListItem.Title>
                      Đơn giá:{" "}
                      <Text style={{ fontWeight: "bold" }}>
                        {formatPrice(item.totalPrice)}đ
                      </Text>
                    </ListItem.Title>
                  </ListItem.Content>
                  <Button
                    icon={<AntDesign name="delete" size={20} color="white" />}
                    buttonStyle={{
                      backgroundColor: "red",
                      padding: 5,
                    }}
                    onPress={() => removeFromOrder(index)}
                  />
                </ListItem>
              </ListItem.Accordion>
            ))
          ) : (
            <Text style={Styles.emptyMessage}>Bạn không có đơn hàng nào</Text>
          )}
        </View>
      </ScrollView>
      {orderItems.length > 0 && (
        <View style={Styles.bottomView}>
          <View style={Styles.priceRow}>
            <Text style={Styles.priceText}>Phí vận chuyển:</Text>
            <Text style={Styles.priceText}>{formatPrice(shippingFee)} đ</Text>
          </View>
          <View style={Styles.priceRow}>
            <Text style={Styles.priceText}>Thành tiền:</Text>
            <Text style={Styles.priceText}>
              {formatPrice(calculateTotalPrice())} đ
            </Text>
          </View>
          {(!isScrollable || isAtBottom) && (
            <Button
              title="Đặt hàng"
              onPress={handleCheckoutPress}
              buttonStyle={{ backgroundColor: "blue", paddingHorizontal: 20 }}
              icon={
                <MaterialIcons
                  name="shopping-cart"
                  size={24}
                  color="white"
                  style={{ marginLeft: 10 }}
                />
              }
              iconRight
              type="solid"
            />
          )}
        </View>
      )}
    </ImageBackground>
  );
};

const formatPrice = (price) => {
  const priceString = price.toString();
  const formattedPrice = priceString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return formattedPrice;
};

export default Order;
