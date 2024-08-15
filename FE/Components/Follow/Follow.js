import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Image, ImageBackground, ScrollView, ActivityIndicator, Alert, RefreshControl, TouchableOpacity } from "react-native";
import { Tab, TabView } from "@rneui/base";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Styles from "./Styles";
import AppStyles from "../../Styles/AppStyles";
import axios, { endpoints, authAPI } from '../../configs/APIs';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const backGround = require("../../Templates/Images/BackGround.png");

const Follow = () => {
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextPage, setNextPage] = useState(endpoints.store);
  const [followedStores, setFollowedStores] = useState([]);
  const [allStores, setAllStores] = useState([]);

  const fetchStores = useCallback(async (url) => {
    try {
      const response = await axios.get(url);

      if (response.data && Array.isArray(response.data.results)) {
        setAllStores((prevStores) => [...prevStores, ...response.data.results]);
        setNextPage(response.data.next);
      } else {
        throw new Error('API response does not contain an array of results');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch stores. Please try again later.');
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const handleLoadMore = () => {
    if (nextPage && !loadingMore) {
      setLoadingMore(true);
      fetchStores(nextPage);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setAllStores([]); // Clear existing stores
    fetchStores(endpoints.store) // Fetch stores from the beginning
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  }, [fetchStores]);

  const handleStorePress = (store) => {
    navigation.navigate('StoreShow', { storeId: store.id });
  };

  const fetchFollowedStores = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const api = authAPI(token);
      const response = await api.get(endpoints['show-follow-store']);

      if (response.data && Array.isArray(response.data)) {
        // Extract store IDs from the follow relationships
        const followedStoreIds = response.data.map(item => item.store);

        // Fetch details for each followed store
        const storeDetailsPromises = followedStoreIds.map(storeId => 
          api.get(endpoints['current-store'](storeId))
        );

        const storeDetailsResponses = await Promise.all(storeDetailsPromises);
        const followedStoresDetails = storeDetailsResponses.map(response => response.data);

        setFollowedStores(followedStoresDetails);
      } else {
        throw new Error('API response does not contain an array of followed stores');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch followed stores. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    if (index === 0) {
      fetchFollowedStores().catch(error => {
        console.error(error);
        setLoading(false);
      });
    } else {
      setAllStores([]); // Clear existing stores before fetching
      fetchStores(endpoints.store).catch(error => {
        console.error(error);
        setLoading(false);
      });
    }
  }, [index, fetchFollowedStores]);

  return (
    <>
      <Tab
        value={index}
        onChange={(e) => setIndex(e)}
        indicatorStyle={{
          backgroundColor: 'white',
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
          <ImageBackground source={backGround} style={[Styles.background, Styles.flex]}>
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => {
                  setRefreshing(true);
                  fetchFollowedStores().finally(() => setRefreshing(false));
                }} />
              }
            >
              {followedStores.map((store, index) => (
                <TouchableOpacity key={index} style={Styles.storeContainer} onPress={() => handleStorePress(store)}>
                  <Image source={{ uri: store.avatar }} style={Styles.storeAvatar} />
                  <View style={Styles.storeInfo}>
                    <Text style={Styles.storeName}>{store.name}</Text>
                    <Text style={Styles.storeAddress}>{store.address_line}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ImageBackground>
        </TabView.Item>
        <TabView.Item style={{ backgroundColor: 'blue', width: '100%' }}>
          <ImageBackground
            source={backGround}
            style={[Styles.background, Styles.flex]}
          >
            {loading ? (
              <ActivityIndicator size="large" color="#ffffff" />
            ) : (
              <ScrollView
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                onScroll={({ nativeEvent }) => {
                  const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                  if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
                    handleLoadMore();
                  }
                }}
                scrollEventThrottle={400}
              >
                {allStores.map((store, index) => (
                  <TouchableOpacity key={index} style={Styles.storeContainer} onPress={() => handleStorePress(store)}>
                    <Image source={{ uri: store.avatar }} style={Styles.storeAvatar} />
                    <View style={Styles.storeInfo}>
                      <Text style={Styles.storeName}>{store.name}</Text>
                      <Text style={Styles.storeAddress}>{store.address_line}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {loadingMore && <ActivityIndicator size="large" color="#ffffff" />}
              </ScrollView>
            )}
          </ImageBackground>
        </TabView.Item>
      </TabView>
    </>
  );
};

export default Follow;
