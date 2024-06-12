import React from "react";
import { View, Text, ImageBackground } from "react-native";
import AppStyles from "../../Styles/AppStyles";
import App from "../../App";
import { Tab, TabView } from "@rneui/base";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Styles from "./Styles";

const backGround = require("../../Templates/Images/BackGround.png");

const Follow = () => {
  const [index, setIndex] = React.useState(0);

  return (
    <>
      <Tab
        value={index}
        onChange={(e) => setIndex(e)}
        indicatorStyle={{
          backgroundColor: index === 0 ? 'white' : 'white', // Change color dynamically
          height: 3,
        }}
        variant="primary"
      >
        <Tab.Item
          title="Đang theo dõi"
          titleStyle={{ fontSize: 12 }}
          icon={({ color, size }) => (
            <MaterialCommunityIcons name="heart" size={24} color={"white"} />
          )}
        />
        <Tab.Item
          title="Cửa hàng"
          titleStyle={{ fontSize: 12 }}
          icon={({ color, size }) => (
            <MaterialCommunityIcons name="storefront" size={24} color={"white"} />
          )}
        />
      </Tab>
      <TabView value={index} onChange={setIndex} animationType="spring">
        <TabView.Item style={{ backgroundColor: 'red', width: '100%' }}>
        <ImageBackground
        source={backGround}
        style={[Styles.background, Styles.flex]}
      >
        <Text>Đang theo dõi</Text>
      </ImageBackground>
        </TabView.Item>
        <TabView.Item style={{ backgroundColor: 'blue', width: '100%' }}>
        <ImageBackground
        source={backGround}
        style={[Styles.background, Styles.flex]}
      >
        <Text>Danh sách cửa hàng</Text>
      </ImageBackground>
        </TabView.Item>
      </TabView>
    </>
  );
};

export default Follow;
