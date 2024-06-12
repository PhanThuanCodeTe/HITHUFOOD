import React from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import Styles from "./Styles";
import AppStyles from "../../Styles/AppStyles";

const FoodSettings = () => {
  const route = useRoute();
  const { food } = route.params;

  return (
    <ScrollView style={AppStyles.background}>
      <View style={AppStyles.flex}>
        <Text style={Styles.h1}>Cài đặt món ăn</Text>
        <Image style={Styles.foodimage} source={{ uri: food.image }} />
        <Text style={Styles.foodname}>{food.name}</Text>
        <Text style={Styles.fooddescription}>
          {food.description || "Không có mô tả nào"}
        </Text>
        <Text style={Styles.foodprice}>Giá: {food.price} VND</Text>
        <Text style={Styles.foodrating}>Đánh giá: {food.average_rating}</Text>
      </View>
    </ScrollView>
  );
};

export default FoodSettings;
