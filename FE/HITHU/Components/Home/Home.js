import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  PermissionsAndroid,
} from "react-native";
import { Searchbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import App from "../../App";
import AppStyles from "../../Styles/AppStyles";
import Styles from "./Styles";
import Food from "../Food/Food";


const backGround = require("../../Templates/Images/BackGround.png");
const Stack = createStackNavigator();

const items = [
  {
    name: "Bánh canh cua siêu ngon 263/15, Nguyễn Xí, Phú Nhuận",
    image:
      "https://res.cloudinary.com/dxtj3bfv3/image/upload/v1715159986/uoqqptalatkkfebdmpsy.jpg",
    price: "60000",
    discout: "0",
    rating: "5.0",
  },
  {
    name: "Trà sữa mix đủ vị miễn nghĩ ra là có!!",
    image:
      "https://res.cloudinary.com/dxtj3bfv3/image/upload/v1715240821/TS_kghpg9.jpg",
    price: "25000",
    discout: "5",
    rating: "4.5",
  },
  {
    name: "Trà trái cây Nhà Thu Ân",
    image:
      "https://res.cloudinary.com/dxtj3bfv3/image/upload/v1715240821/TTC_cjypxj.jpg",
    price: "20000",
    discout: "5",
    rating: "4.5",
  },
  {
    name: "Hủ tiếu Sa Đéc chuẩn vị",
    image:
      "https://res.cloudinary.com/dxtj3bfv3/image/upload/v1715240821/HT_bedn5p.jpg",
    price: "30000",
    discout: "10",
    rating: "5.0",
  },
  {
    name: "Bánh tiêu chiên, bánh còng, bánh cam và các loại bánh chiên",
    image:
      "https://res.cloudinary.com/dxtj3bfv3/image/upload/v1715240821/BT_s2fgpe.jpg",
    price: "5000",
    discout: "10",
    rating: "3.5",
  },
  {
    name: "Hủ tiếu chay",
    image:
      "https://res.cloudinary.com/dxtj3bfv3/image/upload/v1715240821/HTC_tazetb.jpg",
    price: "25000",
    discout: "0",
    rating: "4.5",
  },
  {
    name: "Bún real Cua Tân Bình",
    image:
      "https://res.cloudinary.com/dxtj3bfv3/image/upload/v1715240821/BR_cvnbxm.jpg",
    price: "35000",
    discout: "0",
    rating: "5.0",
  },
  {
    name: "Bánh mix các loại, bánh nội địa trung",
    image:
      "https://res.cloudinary.com/dxtj3bfv3/image/upload/v1715240821/BG_g1wsid.jpg",
    price: "10000",
    discout: "5",
    rating: "4.0",
  },
  {
    name: "Bánh mì bà Năm",
    image:
      "https://res.cloudinary.com/dxtj3bfv3/image/upload/v1715240821/BM_lhargu.jpg",
    price: "30000",
    discout: "5",
    rating: "3.0",
  },
  {
    name: "Bún bò hẻm 26/12/100 Quang Trung, Gò Vấp",
    image:
      "https://res.cloudinary.com/dxtj3bfv3/image/upload/v1715240821/BBH_ppupon.jpg",
    price: "25000",
    discout: "10",
    rating: "3.5",
  },
];

const Home = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState({ latitude: null, longitude: null });

  const handleNavigateToFood = (item) => {
    navigation.navigate("Detail", { item });
  };

  const handleViewAll = () => {
    navigation.navigate("ViewFood", { items });
  };



  return (
    <ImageBackground source={backGround} style={AppStyles.background}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Searchbar
          placeholder="Search"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={Styles.searchBar}
        />
        <View style={AppStyles.margintop}>
          <View style={Styles.shortcutbox}>
            <Text style={[Styles.h1]}>Món ngon mỗi lol</Text>
            <TouchableOpacity onPress={handleViewAll}>
              <Text style={[Styles.button]}>Xem tất cả =&gt;</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal={true}
            style={Styles.xscrollView}
            showsHorizontalScrollIndicator={false}
          >
            {items.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleNavigateToFood(item)}
              >
                <View style={Styles.itemContainer}>
                  <Image source={{ uri: item.image }} style={Styles.image} />
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[Styles.itemName, Styles.text]}
                  >
                    {item.name.length > 20
                      ? `${item.name.substring(0, 20)}...`
                      : item.name}
                  </Text>
                  <Text style={[Styles.itemPrice]}>
                    {formatPrice(item.price)}đ
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const formatPrice = (price) => {
  const priceString = price.toString();
  const formattedPrice = priceString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return formattedPrice;
};

export default Home;
