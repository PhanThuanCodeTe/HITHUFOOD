import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Appbar } from "react-native-paper";
import { Entypo } from "@expo/vector-icons";
import { Rating, Button, BottomSheet, ListItem, Icon } from "react-native-elements";
import AppStyles from "../../Styles/AppStyles";
import Styles from "./Styles";
import { OrderContext } from '../OrderContext/OrderContext';




const backGround = require("../../Templates/Images/BackGround.png");


const Food = () => {
  
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params;
  
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const handleAddToOrder = () => {
    setIsBottomSheetVisible(true);
  };

  const { addToOrder } = useContext(OrderContext);
  
  const handlePlaceOrder = () => {
    addToOrder(item, quantity);
    setIsBottomSheetVisible(false);
  };
  
  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const formatPrice = (price) => {
    const priceString = price.toString();
    const formattedPrice = priceString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return formattedPrice;
  };

  return (
    <ImageBackground source={backGround} style={[Styles.flex]}>
      <View style={[Styles.container]}>
        <View style={Styles.imagecontainer}>
          <Image source={{ uri: item.image }} style={[Styles.image]} />
        </View>
        <Text style={Styles.name}>{item.name}</Text>
        <View style={Styles.ratingcontainer}>
        <Rating 
            startingValue={item.rating}
            readonly 
            imageSize={24} 
          />
        </View>
        <View style={Styles.showrow}>
          <View style={Styles.showrow}>
            <Text style={Styles.h2}>Đơn giá: </Text>
            <Text style={Styles.showprice}>
            {formatPrice(item.price)}đ
            </Text>
          </View>
          <Button
  title={
    <View style={{ flexDirection: 'row', alignItems: 'center'}}>
      <Text style={{ marginRight: 5, color:"white", fontSize:18 }}>Đặt hàng</Text>
      <Icon
        name="add-shopping-cart"
        size={20}
        color="white"
      />
    </View>
  }
  buttonStyle={Styles.buttonaddorder}
  onPress={handleAddToOrder}
/>  
        </View>
      </View>
      <BottomSheet
        isVisible={isBottomSheetVisible}
        containerStyle={{ backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)', borderRadius:15, }}
        onBackdropPress={() => {console.log('Backdrop pressed');setIsBottomSheetVisible(false)}} // What the fuck this dont work?
      >
        <ListItem containerStyle={{ backgroundColor: 'white', borderRadius: 15 }}>
          <ListItem.Content>
            <View>
              <Text style={[Styles.title, {fontWeight:"bold", color:"#60D160"}]}>
                Bạn muốn thêm món này vào đơn hàng?
              </Text>
              <Text style={[Styles.name, {marginBottom:20}]}>{item.name}</Text>
              <View style={Styles.showrow}>
            <Text style={Styles.h2}>Đơn giá: </Text>
            <Text style={Styles.showprice}>
            {formatPrice(item.price)}đ
            </Text>
        </View>
              <View style={Styles.showrow}>
                <Text style={Styles.h2}>Số lượng: </Text>
                <View style={Styles.showrow}>
                <Button
                  icon={{
                    name: "remove",
                    size: 20,
                    color: "white",
                  }}
                  buttonStyle={{ backgroundColor: 'grey', padding: 5, }}
                  onPress={decrementQuantity}
                />
                <Text style={Styles.showquantity}>{quantity}</Text>
                <Button
                  icon={{
                    name: "add",
                    size: 20,
                    color: "white",
                  }}
                  buttonStyle={{ backgroundColor: 'grey', padding: 5, marginLeft:10, }}
                  onPress={incrementQuantity}
                />
                </View>
              </View>
              <View style={Styles.cancelororder}>
                <Button
                  title="Hủy"
                  buttonStyle={Styles.buttoncancel}
                  onPress={() => setIsBottomSheetVisible(false)}
                />
                <Button
                  title="Đặt hàng"
                  buttonStyle={Styles.buttonorder}
                  onPress={handlePlaceOrder}
                  // Add your order handling logic here
                />
              </View>
            </View>
          </ListItem.Content>
        </ListItem>
      </BottomSheet>
    </ImageBackground>
  );
};

export default Food;
