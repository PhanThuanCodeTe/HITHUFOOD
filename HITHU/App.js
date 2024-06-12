import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "react-native";

// Import your components
import Home from "./Components/Home/Home";
import User from "./Components/User/User";
import Order from "./Components/Order/Order";
import Follow from "./Components/Follow/Follow";
import Notification from "./Components/Notification/Notification";
import Food from "./Components/Food/Food";
import AllItems from "./Components/AllItems/AllItems";
import Store from "./Components/Store/Store";
import StoreCreate from "./Components/Store/StoreCreate";
import UserInfo from "./Components/User/UserInfo";
import FoodSettings from "./Components/Store/FoodSettings";

import AnimatedTabBarIcon from "./Components/AnimatedTabBarIcon/AnimatedTabBarIcon";
import OrderProvider from "./Components/OrderContext/OrderContext";

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeScreen"
      component={Home}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Detail"
      component={Food}
      options={{ title: 'Chi tiết' }}
    />
    <Stack.Screen
      name="ViewFood"
      component={AllItems}
      options={{ title: 'Xem món ăn' }}
    />
  </Stack.Navigator>
);

const UserStack = () => (
  <Stack.Navigator initialRouteName="UserProfile">
    <Stack.Screen
      name="UserProfile"
      component={User}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="UserInfo"
      component={UserInfo}
      options={{ title: 'Thông tin người dùng', headerLeft: null }}
    />
    <Stack.Screen
      name="Store"
      component={Store}
      options={{ title: 'Cửa hàng của tôi' }}
    />
    <Stack.Screen
      name="StoreCreate"
      component={StoreCreate}
      options={{ title: 'Tạo cửa hàng mới' }}
    />
    <Stack.Screen 
    name="FoodSettings" 
    component={FoodSettings} 
    options={{ title: 'Chỉnh sửa thông tin Món ăn' }}
    />
  </Stack.Navigator>
);

const MainTabNavigator = () => {
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "green",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          display: "flex",
        },
      })}
    >
      <Tab.Screen
        name="Follow"
        component={Follow}
        options={{
          title: 'Theo dõi',
          tabBarLabel: 'Theo dõi',
          tabBarIcon: ({ focused, color, size }) => (
            <AnimatedTabBarIcon
              name={focused ? "account-heart" : "account-heart-outline"}
              color={color}
              size={size}
              focused={focused}
              onPress={() => navigation.navigate('Follow')}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Order"
        component={Order}
        options={{
          title: 'Đơn hàng',
          tabBarLabel: 'Đơn hàng',
          tabBarIcon: ({ focused, color, size }) => (
            <AnimatedTabBarIcon
              name={focused ? "cart" : "cart-outline"}
              color={color}
              size={size}
              focused={focused}
              onPress={() => navigation.navigate('Order')}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          title: 'Trang chủ',
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ focused, color, size }) => (
            <AnimatedTabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
              size={size}
              focused={focused}
              onPress={() => navigation.navigate('Home')}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Notification"
        component={Notification}
        options={{
          title: 'Thông báo',
          tabBarLabel: 'Thông báo',
          tabBarIcon: ({ focused, color, size }) => (
            <AnimatedTabBarIcon
              name={focused ? "bell" : "bell-outline"}
              color={color}
              size={size}
              focused={focused}
              onPress={() => navigation.navigate('Notification')}
            />
          ),
        }}
      />
      <Tab.Screen
        name="User"
        component={UserStack} // Update to UserStack
        options={{
          title: 'Tài khoản',
          tabBarLabel: 'Tài khoản',
          tabBarIcon: ({ focused, color, size }) => (
            <AnimatedTabBarIcon
              name={focused ? "account" : "account-outline"}
              color={color}
              size={size}
              focused={focused}
              onPress={() => navigation.navigate('User')}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <OrderProvider>
      <NavigationContainer>
        <MainTabNavigator />
      </NavigationContainer>
    </OrderProvider>
  );
};

export default App;
