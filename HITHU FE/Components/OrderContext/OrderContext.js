import React, { createContext, useState } from 'react';
import { Alert } from 'react-native';

export const OrderContext = createContext();

const OrderProvider = ({ children }) => {
  const [orderItems, setOrderItems] = useState([]);

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

  const incrementQuantity = (index) => {
    const newOrderItems = [...orderItems];
    newOrderItems[index].quantity++;
    setOrderItems(newOrderItems);
  };

  const decrementQuantity = (index) => {
    const newOrderItems = [...orderItems];
    if (index >= 0 && index < newOrderItems.length) {
      if (newOrderItems[index].quantity > 1) {
        newOrderItems[index].quantity--;
      } else {
        if (newOrderItems[index].quantity === 1) {
          removeFromOrder(index);
        }
      }
      setOrderItems(newOrderItems);
    }
  };

  return (
    <OrderContext.Provider value={{ orderItems, addToOrder, removeFromOrder, incrementQuantity, decrementQuantity }}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderProvider;
