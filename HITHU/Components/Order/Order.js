import React, { useContext, useState, useEffect } from "react";
import { View, Text, ImageBackground, ScrollView, Alert } from "react-native";
import { OrderContext } from "../OrderContext/OrderContext";
import { Button } from "react-native-elements";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import Styles from "./Styles";
import { GEOCODING_APIKEY } from "@env";

const backGround = require("../../Templates/Images/BackGround.png");
const address = "36 Phan Huy Thực, Quận 7";
const SHIPPING_FEE = 10000;

const Order = () => {
  const { orderItems, removeFromOrder, incrementQuantity, decrementQuantity } = useContext(OrderContext);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [latLon, setLatLon] = useState(null);

  useEffect(() => {
    const layoutHeight = 600; 
    const contentHeight = orderItems.length * 100;
    setIsScrollable(layoutHeight < contentHeight);
    setIsAtBottom(layoutHeight >= contentHeight);
  }, [orderItems]);

  useEffect(() => {
    const formattedAddress = formatAddress(address);
    const apiUrl = `https://geocode.maps.co/search?q=${formattedAddress}&api_key=${GEOCODING_APIKEY}`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setLatLon({ lat, lon });
          console.log("Latitude:", lat, "Longitude:", lon);
        }
      })
      .catch(error => console.error("Error fetching geocode data:", error));
  }, []);

  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    setIsAtBottom(isBottom);
    setIsScrollable(layoutMeasurement.height < contentSize.height);
  };

  const handleCheckoutPress = () => {
    Alert.alert("Checkout", "You have clicked the checkout button.");
  };

  const calculateTotalPrice = () => {
    const totalItemPrice = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    return totalItemPrice + SHIPPING_FEE;
  };

  return (
    <ImageBackground source={backGround} style={Styles.background}>
      <ScrollView
        contentContainerStyle={Styles.scrollViewContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={Styles.container}>
          {orderItems.length > 0 ? (
            orderItems.map((item, index) => (
              <View key={index} style={Styles.itemContainer}>
                <View style={Styles.itemNameContainer}>
                  <Text numberOfLines={1} style={Styles.itemName}>
                    {item.name}
                  </Text>
                </View>
                <View style={Styles.itemDetailsContainer}>
                  <Text style={Styles.itemQuantity}>Số lượng: </Text>
                  <Button
                    icon={{
                      name: "remove",
                      size: 20,
                      color: "white",
                    }}
                    buttonStyle={{ backgroundColor: "grey", padding: 5 }}
                    onPress={() => decrementQuantity(index)}
                  />
                  <Text style={Styles.itemQuantity}>{item.quantity}</Text>
                  <Button
                    icon={{
                      name: "add",
                      size: 20,
                      color: "white",
                    }}
                    buttonStyle={{
                      backgroundColor: "grey",
                      padding: 5,
                      marginLeft: 10,
                    }}
                    onPress={() => incrementQuantity(index)}
                  />
                  <Text style={Styles.itemPrice}>{formatPrice(item.price)}đ</Text>
                  <Button
                    icon={<AntDesign name="delete" size={20} color="white" />}
                    buttonStyle={{
                      backgroundColor: "red",
                      padding: 5,
                      marginLeft: 10,
                    }}
                    onPress={() => removeFromOrder(index)}
                  />
                </View>
              </View>
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
            <Text style={Styles.priceText}>{formatPrice(SHIPPING_FEE)} đ</Text>
          </View>
          <View style={Styles.priceRow}>
            <Text style={Styles.priceText}>Thành tiền:</Text>
            <Text style={Styles.priceText}>{formatPrice(calculateTotalPrice())} đ</Text>
          </View>
          {(!isScrollable || isAtBottom) && (
            <>
              <Text style={Styles.addressText}>Địa chỉ giao hàng:</Text>
              <Text style={Styles.addressText}>{address}</Text>
              <Button
                title="Thanh toán"
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
            </>
          )}
        </View>
      )}
    </ImageBackground>
  );
};

const formatAddress = (address) => {
  return address
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[,\.]/g, "")
    .replace(/\s+/g, "+")
    .replace(/quan/g, "district") + "+ho+chi+minh+city";
};

const formatPrice = (price) => {
  const priceString = price.toString();
  const formattedPrice = priceString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return formattedPrice;
};

export default Order;
