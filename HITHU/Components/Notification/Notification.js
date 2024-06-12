import React from "react";
import { View, Text, ImageBackground, Image, TouchableOpacity, ScrollView } from "react-native";
import AppStyles from "../../Styles/AppStyles";
import App from "../../App";
import Styles from "./Styles";
import { Button } from "@rneui/base";
import { Icon } from "@rneui/base";

const backGround = require("../../Templates/Images/BackGround.png");

const Notification = () => {
  return (
    <ImageBackground source={backGround} style={AppStyles.background}>
      <View>
        <Text style={Styles.h1}>Cài đặt cửa hàng</Text>
      </View>
      <ScrollView>
      <View style={AppStyles.flex}>
        <View style={AppStyles.flex}>
          <TouchableOpacity>
          <Image style={Styles.avatar} source={require("../../Templates/Images/water.jpg")}></Image>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={Styles.storename}>Cửa hàng Uy tính</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
      <Text style={[Styles.h1, {textAlign:"left"}]}> Thêm/Xóa món ăn</Text>
      <View style={[Styles.box, AppStyles.flex]}>
        <TouchableOpacity>
        <Image style={Styles.foodimage} source={require("../../Templates/Images/BBH.jpg")}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={Styles.textContainer}>
        <Text style={Styles.foodname}>Food Name No.1</Text>
        </TouchableOpacity>
      </View>
      <View style={[Styles.box, AppStyles.flex]}>
        <TouchableOpacity>
        <Image style={Styles.foodimage} source={require("../../Templates/Images/BBH.jpg")}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={Styles.textContainer}>
        <Text style={Styles.foodname}>Food Name No.1</Text>
        </TouchableOpacity>
      </View>
      <View style={[Styles.box, AppStyles.flex]}>
        <TouchableOpacity>
        <Image style={Styles.foodimage} source={require("../../Templates/Images/BBH.jpg")}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={Styles.textContainer}>
        <Text style={Styles.foodname}>Food Name No.1</Text>
        </TouchableOpacity>
      </View>
      <View style={[Styles.box, AppStyles.flex]}>
        <TouchableOpacity>
        <Image style={Styles.foodimage} source={require("../../Templates/Images/BBH.jpg")}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={Styles.textContainer}>
        <Text style={Styles.foodname}>Food Name No.1</Text>
        </TouchableOpacity>
      </View>
      <View style={[Styles.box, AppStyles.flex]}>
        <TouchableOpacity>
        <Image style={Styles.foodimage} source={require("../../Templates/Images/BBH.jpg")}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={Styles.textContainer}>
        <Text style={Styles.foodname}>Food Name No.1</Text>
        </TouchableOpacity>
      </View>
      <View style={[Styles.box, AppStyles.flex]}>
        <TouchableOpacity>
        <Image style={Styles.foodimage} source={require("../../Templates/Images/BBH.jpg")}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={Styles.textContainer}>
        <Text style={Styles.foodname}>Food Name No.1</Text>
        </TouchableOpacity>
      </View>
      <View style={[Styles.box, AppStyles.flex]}>
        <TouchableOpacity>
        <Image style={Styles.foodimage} source={require("../../Templates/Images/BBH.jpg")}></Image>
        </TouchableOpacity>
        <TouchableOpacity style={Styles.textContainer}>
        <Text style={Styles.foodname}>Food Name No.1</Text>
        </TouchableOpacity>
      </View>
      </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default Notification;
