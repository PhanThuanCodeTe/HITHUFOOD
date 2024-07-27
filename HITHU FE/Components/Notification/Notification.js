import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import AppStyles from "../../Styles/AppStyles";
import Styles from "./Styles";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { endpoints, authAPI } from "../../configs/APIs";
import { Badge, Overlay, Button, ListItem } from "@rneui/themed";

const backGround = require("../../Templates/Images/BackGround.png");

const Notification = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [storeOrders, setStoreOrders] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [
    isDeliveredOrdersAccordionExpanded,
    setIsDeliveredOrdersAccordionExpanded,
  ] = useState(false);
  const [
    isCancelledOrdersAccordionExpanded,
    setIsCancelledOrdersAccordionExpanded,
  ] = useState(false);

  const clearOrders = () => {
    setStoreOrders([]);
    setUserOrders([]);
    setDeliveredOrders([]);
    setCancelledOrders([]);
  };

  const fetchStoreOrders = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const api = authAPI(token);
      const response = await api.get(endpoints["store-order"]);

      const pendingAndDeliveringOrders = [];
      const deliveredOrders = [];
      const cancelledOrders = [];

      const ordersWithFoodNames = await Promise.all(
        response.data.map(async (order) => {
          const itemsWithFoodNames = await Promise.all(
            order.items.map(async (item) => {
              const foodResponse = await api.get(
                endpoints["update-food"](item.food)
              );
              return { ...item, food: foodResponse.data.name };
            })
          );
          const orderWithFoodNames = {
            ...order,
            items: itemsWithFoodNames,
            isStoreOrder: true,
          };

          if (order.status === "PENDING" || order.status === "DELIVERING") {
            pendingAndDeliveringOrders.push(orderWithFoodNames);
          } else if (order.status === "DELIVERED") {
            deliveredOrders.push(orderWithFoodNames);
          } else if (order.status === "CANCELLED") {
            cancelledOrders.push(orderWithFoodNames);
          }

          return orderWithFoodNames;
        })
      );

      setStoreOrders(pendingAndDeliveringOrders);
      setDeliveredOrders(deliveredOrders);
      setCancelledOrders(cancelledOrders);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setStoreOrders([]);
        setDeliveredOrders([]);
        setCancelledOrders([]);
      } else {
        console.error("Error fetching store orders:", err);
      }
    }
  };

  const fetchUserOrders = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const api = authAPI(token);
      const response = await api.get(endpoints["my-order"]);

      const pendingAndDeliveringOrders = [];
      const deliveredOrders = [];
      const cancelledOrders = [];

      const ordersWithFoodNames = await Promise.all(
        response.data.map(async (order) => {
          const itemsWithFoodNames = await Promise.all(
            order.items.map(async (item) => {
              const foodResponse = await api.get(
                endpoints["update-food"](item.food)
              );
              return { ...item, food: foodResponse.data.name };
            })
          );
          const orderWithFoodNames = { ...order, items: itemsWithFoodNames };

          if (order.status === "PENDING" || order.status === "DELIVERING") {
            pendingAndDeliveringOrders.push(orderWithFoodNames);
          } else if (order.status === "DELIVERED") {
            deliveredOrders.push(orderWithFoodNames);
          } else if (order.status === "CANCELLED") {
            cancelledOrders.push(orderWithFoodNames);
          }

          return orderWithFoodNames;
        })
      );

      setUserOrders(pendingAndDeliveringOrders);
      setDeliveredOrders((prevDeliveredOrders) => [
        ...prevDeliveredOrders,
        ...deliveredOrders,
      ]);
      setCancelledOrders((prevCancelledOrders) => [
        ...prevCancelledOrders,
        ...cancelledOrders,
      ]);
    } catch (err) {
      console.error("Error fetching user orders:", err);
      setUserOrders([]);
      setDeliveredOrders([]);
      setCancelledOrders([]);
    }
  };

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStoreOrders(), fetchUserOrders()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem("accessToken");
    const newLoginState = !!token;
    setIsLoggedIn(newLoginState);
    if (newLoginState) {
      fetchAllOrders();
    } else {
      clearOrders();
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchStoreOrders(), fetchUserOrders()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (token) {
        setIsLoggedIn(true);
        fetchStoreOrders();
        fetchUserOrders();
      } else {
        setIsLoggedIn(false);
        setStoreOrders([]); // Clear orders if not logged in
      }
    };

    // Listen for any login changes (this could be done via context or event listeners)
    checkLoginStatus();
  }, []);

  if (loading) {
    return (
      <View style={Styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <ImageBackground source={backGround} style={AppStyles.background}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={Styles.centered}>
            <Text style={Styles.h1}>
              Bạn cần đăng nhập để xem thông báo của mình.
            </Text>
          </View>
        </ScrollView>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <View style={Styles.centered}>
        <Text style={Styles.errorText}>{error}</Text>
      </View>
    );
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllOrders();
  };

  const handleOrderPress = (order) => {
    setSelectedOrder(order);
    setIsOverlayVisible(true);
  };

  const confirmOrder = async (orderId) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const api = authAPI(token);
      console.log("Order id:", orderId);

      const response = await api.post(endpoints["confirm-order"](orderId));

      console.log("Confirm order response:", response.data);

      // Refresh the orders after confirmation
      setIsOverlayVisible(false);
      await fetchAllOrders();
    } catch (err) {
      console.error("Error confirming order:", err);
      if (err.response) {
        console.error("Error response:", err.response.data);
        console.error("Error status:", err.response.status);
        console.error("Error headers:", err.response.headers);
      }
    }
  };

  const rejectOrder = async (orderId) => {
    Alert.alert("Cảnh báo", "Bạn có muốn hủy đơn hàng này?", [
      {
        text: "Không",
        onPress: () => setIsOverlayVisible(false),
        style: "cancel",
      },
      {
        text: "Có",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("accessToken");
            if (!token) {
              setIsLoggedIn(false);
              return;
            }
            const api = authAPI(token);
            console.log("Order id:", orderId);

            const response = await api.delete(
              endpoints["cancel-order"](orderId)
            );

            if (response.status === 204) {
              Alert.alert("Thông báo", "Bạn đã hủy đơn hàng thành công");
            } else {
              console.log("Unexpected response status:", response.status);
            }

            setIsOverlayVisible(false);
            await fetchAllOrders();
          } catch (err) {
            console.error("Error canceling order:", err);
            if (err.response) {
              console.error("Error response:", err.response.data);
              console.error("Error status:", err.response.status);
              console.error("Error headers:", err.response.headers);
            }
          }
        },
      },
    ]);
  };

  const storeRejectOrder = async (orderId) => {
    Alert.alert("Cảnh báo", "Bạn có muốn hủy đơn hàng này?", [
      {
        text: "Không",
        onPress: () => setIsOverlayVisible(false),
        style: "cancel",
      },
      {
        text: "Có",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("accessToken");
            if (!token) {
              setIsLoggedIn(false);
              return;
            }
            const api = authAPI(token);
            console.log("Order id:", orderId);

            const response = await api.delete(
              endpoints["cancel-order"](orderId)
            );

            if (response.status === 204) {
              Alert.alert("Thông báo", "Bạn đã hủy đơn hàng thành công");
            } else {
              console.log("Unexpected response status:", response.status);
            }

            setIsOverlayVisible(false);
            await fetchAllOrders();
          } catch (err) {
            console.error("Error canceling order:", err);
            if (err.response) {
              console.error("Error response:", err.response.data);
              console.error("Error status:", err.response.status);
              console.error("Error headers:", err.response.headers);
            }
          }
        },
      },
    ]);
  };

  const handleUserConfirmOrder = async (orderId) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }
      const api = authAPI(token);
      console.log("Order id:", orderId);

      const response = await api.post(endpoints["confirm-recieve"](orderId));

      console.log("Confirm user order recieve response:", response.data);

      // Refresh the orders after confirmation
      setIsOverlayVisible(false);
      await fetchAllOrders();
    } catch (err) {
      console.error("Error confirming order:", err);
      if (err.response) {
        console.error("Error response:", err.response.data);
        console.error("Error status:", err.response.status);
        console.error("Error headers:", err.response.headers);
      }
    }
  };

  const renderStoreOrderDetails = () => {
    if (!selectedOrder || !selectedOrder.isStoreOrder) return null;
    console.log("Selected Order:", selectedOrder);

    return (
      <View style={Styles.overlayContainer}>
        <ScrollView style={Styles.overlayScrollView}>
          <Text style={Styles.overlayTitle}>Chi tiết đơn hàng</Text>
          <Text style={Styles.overlayText}>
            <Text style={Styles.bold}>Mã đơn hàng: </Text>
            {selectedOrder.id}
          </Text>
          <Text style={Styles.overlayText}>
            <Text style={Styles.bold}>Khách hàng: </Text>
            {selectedOrder.user_name}
          </Text>
          <Text style={Styles.overlayText}>
            <Text style={Styles.bold}>Địa chỉ: </Text>
            {selectedOrder.address}
          </Text>
          <Text style={Styles.overlayText}>
            <Text style={Styles.bold}>Tổng thanh toán: </Text>
            {formatPrice(selectedOrder.total)} đ
          </Text>
          <Text style={Styles.overlaySubtitle}>Món ăn:</Text>
          {selectedOrder.items.map((item, index) => (
            <View key={index} style={Styles.itemContainer}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={Styles.overlayText}>- {item.food}</Text>
                <Text style={Styles.overlayText}>
                  <Text style={Styles.bold}>Số lượng</Text>: {item.quantity}
                </Text>
              </View>
              {item.order_item_topping.length > 0 && (
                <Text style={Styles.overlayText}>
                  <Text style={Styles.bold}>Topping:</Text>{" "}
                  {item.order_item_topping
                    .map((t) => t.topping_name)
                    .join(", ")}
                </Text>
              )}
            </View>
          ))}
          <View style={Styles.buttonContainer}>
            {selectedOrder.isStoreOrder &&
              selectedOrder.status === "PENDING" && (
                <>
                  <Button
                    title="Hủy"
                    buttonStyle={Styles.rejectButton}
                    onPress={() => storeRejectOrder(selectedOrder.id)}
                  />
                  <Button
                    title="Giao hàng"
                    buttonStyle={Styles.confirmButton}
                    onPress={() => confirmOrder(selectedOrder.id)}
                  />
                </>
              )}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderUserOrderDetails = () => {
    if (!selectedOrder || selectedOrder.isStoreOrder) return null;
    console.log("Selected Order:", selectedOrder);

    return (
      <View style={Styles.overlayContainer}>
        <ScrollView style={Styles.overlayScrollView}>
          <Text style={Styles.overlayTitle}>Chi tiết đơn hàng</Text>
          <Text style={Styles.overlayText}>
            <Text style={Styles.bold}>Mã đơn hàng: </Text>
            {selectedOrder.id}
          </Text>
          <Text style={Styles.overlayText}>
            <Text style={Styles.bold}>Khách hàng: </Text>
            {selectedOrder.user_name}
          </Text>
          <Text style={Styles.overlayText}>
            <Text style={Styles.bold}>Địa chỉ: </Text>
            {selectedOrder.address}
          </Text>
          <Text style={Styles.overlayText}>
            <Text style={Styles.bold}>Tổng thanh toán: </Text>
            {formatPrice(selectedOrder.total)} đ
          </Text>
          <Text style={Styles.overlaySubtitle}>Món ăn:</Text>
          {selectedOrder.items.map((item, index) => (
            <View key={index} style={Styles.itemContainer}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={Styles.overlayText}>- {item.food}</Text>
                <Text style={Styles.overlayText}>
                  <Text style={Styles.bold}>Số lượng</Text>: {item.quantity}
                </Text>
              </View>
              {item.order_item_topping.length > 0 && (
                <Text style={Styles.overlayText}>
                  <Text style={Styles.bold}>Topping:</Text>{" "}
                  {item.order_item_topping
                    .map((t) => t.topping_name)
                    .join(", ")}
                </Text>
              )}
            </View>
          ))}
          <View style={Styles.buttonContainer}>
            {selectedOrder.status === "PENDING" && (
              <Button
                title="Hủy đơn hàng"
                buttonStyle={Styles.rejectButton}
                onPress={() => rejectOrder(selectedOrder.id)}
              />
            )}
            {selectedOrder.status === "DELIVERING" && (
              <Button
                title="Tôi đã nhận được hàng"
                buttonStyle={Styles.confirmButton}
                onPress={() => handleUserConfirmOrder(selectedOrder.id)}
              />
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  const OrderItem = ({ order, onPress }) => (
    <TouchableOpacity style={[Styles.box, AppStyles.flex]} onPress={onPress}>
      {order.status === "PENDING" && (
        <Badge
          value="Đang chờ"
          status="error"
          containerStyle={{
            position: "absolute",
            top: -4,
            right: -4,
          }}
        />
      )}
      {order.status === "DELIVERING" && (
        <Badge
          value="Đang giao"
          status="primary"
          containerStyle={{
            position: "absolute",
            top: -4,
            right: -4,
          }}
        />
      )}
      {order.status === "DELIVERED" && (
        <Badge
          value="Thành công"
          status="success"
          containerStyle={{
            position: "absolute",
            top: -4,
            right: -4,
          }}
        />
      )}
      {order.status === "CANCELLED" && (
        <Badge
          value="Bị hủy"
          status="warning"
          containerStyle={{
            position: "absolute",
            top: -4,
            right: -4,
          }}
        />
      )}
      <View style={Styles.textContainer}>
        <Text style={Styles.orderTitle}>Đơn hàng:</Text>
        <Text style={Styles.orderDetail}>Mã đơn hàng: {order.id}</Text>
        <Text style={Styles.orderDetail}>Khách hàng: {order.user_name}</Text>
        <Text style={Styles.orderDetail}>Địa chỉ: {order.address}</Text>
        <Text style={Styles.orderDetail}>
          Tổng thanh toán:{" "}
          <Text style={{ fontWeight: "bold" }}>
            {formatPrice(order.total)} đ
          </Text>
        </Text>
        <Text style={Styles.orderDetail}>
          Trạng thái:{" "}
          <Text style={{ fontWeight: "bold" }}>
            {order.status === "PENDING"
              ? "Đang chờ"
              : order.status === "DELIVERING"
              ? "Đang giao"
              : order.status === "DELIVERED"
              ? "Đã giao"
              : order.status === "CANCELLED"
              ? "Dạ bị hủy"
              : order.status}
          </Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderDeliveredOrdersAccordion = () => {
    const deliveredOrderCount = deliveredOrders.length;

    return (
      <View>
        <ListItem.Accordion
          onPress={() =>
            setIsDeliveredOrdersAccordionExpanded(
              !isDeliveredOrdersAccordionExpanded
            )
          }
          content={
            <ListItem.Content>
              <ListItem.Title>
                Bạn đã đặt {deliveredOrderCount} đơn hàng thành công
              </ListItem.Title>
            </ListItem.Content>
          }
          isExpanded={isDeliveredOrdersAccordionExpanded}
        >
          {deliveredOrders.map((order, index) => (
            <OrderItem key={index} order={order} />
          ))}
        </ListItem.Accordion>
      </View>
    );
  };

  const renderCancelledOrdersAccordion = () => {
    const cancelledOrderCount = cancelledOrders.length;

    return (
      <View>
        <ListItem.Accordion
          onPress={() =>
            setIsCancelledOrdersAccordionExpanded(
              !isCancelledOrdersAccordionExpanded
            )
          }
          content={
            <ListItem.Content>
              <ListItem.Title>
                Các đơn hàng bị hủy ({cancelledOrderCount})
              </ListItem.Title>
            </ListItem.Content>
          }
          isExpanded={isCancelledOrdersAccordionExpanded}
        >
          {cancelledOrders.map((order, index) => (
            <OrderItem key={index} order={order} />
          ))}
        </ListItem.Accordion>
      </View>
    );
  };

  return (
    <ImageBackground source={backGround} style={AppStyles.background}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View>
          <Text style={Styles.title}>Thông Báo từ cửa hàng của bạn</Text>
          {storeOrders.length > 0 ? (
            storeOrders.map((order, index) => (
              <OrderItem
                key={index}
                order={order}
                onPress={() => handleOrderPress(order)}
              />
            ))
          ) : (
            <Text style={{ fontWeight: "bold", textAlign: "center" }}>
              Không có thông báo nào từ cửa hàng.
            </Text>
          )}

          <Text style={[Styles.title, { marginTop: 20 }]}>
            Đơn hàng của tôi:
          </Text>
          {userOrders.length > 0 ? (
            userOrders.map((order, index) => (
              <OrderItem
                key={index}
                order={order}
                onPress={() => handleOrderPress(order)}
              />
            ))
          ) : (
            <Text style={{ fontWeight: "bold", textAlign: "center" }}>
              Bạn chưa có đơn hàng nào.
            </Text>
          )}
          {renderDeliveredOrdersAccordion()}
          {renderCancelledOrdersAccordion()}
        </View>
      </ScrollView>
      <Overlay
        isVisible={isOverlayVisible}
        onBackdropPress={() => setIsOverlayVisible(false)}
        overlayStyle={Styles.overlay}
      >
        {renderStoreOrderDetails()}
        {renderUserOrderDetails()}
      </Overlay>
    </ImageBackground>
  );
};

const formatPrice = (price) => {
  const priceString = price.toString();
  const formattedPrice = priceString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return formattedPrice;
};

export default Notification;
