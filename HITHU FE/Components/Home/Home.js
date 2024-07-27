import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Searchbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import AppStyles from "../../Styles/AppStyles";
import Styles from "./Styles";
import axios, { endpoints } from "../../configs/APIs";
import { Chip } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";

const backGround = require("../../Templates/Images/BackGround.png");

const Home = () => {
  const navigation = useNavigation();
  const [stores, setStores] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextPage, setNextPage] = useState(endpoints.store);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState({ foods: [], stores: [] });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryFoods, setCategoryFoods] = useState({});
  const [isSearching, setIsSearching] = useState(false);

  const fetchStores = useCallback(async (url) => {
    try {
      const response = await axios.get(url);

      if (response.data && Array.isArray(response.data.results)) {
        setStores((prevStores) => [...prevStores, ...response.data.results]);
        setNextPage(response.data.next);
      } else {
        throw new Error("API response does not contain an array of results");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch stores. Please try again later.");
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const fetchFoods = useCallback(async () => {
    try {
      const response = await axios.get(endpoints.food);

      if (response.data && Array.isArray(response.data.results)) {
        setFoods(response.data.results);
      } else {
        throw new Error("API response does not contain an array of results");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch foods. Please try again later.");
      console.error(error);
    }
  }, []);

  const handleNavigateToFood = (food) => {
    navigation.navigate('FoodShown', { foodId: food.id });
  };

  const fetchCategories = async () => {
    try {
      let allCategories = [];
      let nextPage = endpoints["category"];

      while (nextPage) {
        const response = await axios.get(nextPage);
        const { results, next } = response.data;
        allCategories = [...allCategories, ...results];

        if (next) {
          nextPage = next;
        } else {
          nextPage = null;
        }
      }

      setCategories(allCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleLoadMore = () => {
    if (nextPage && !loadingMore) {
      setLoadingMore(true);
      fetchStores(nextPage);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setFoods([]);
    setStores([]);
    setCategories([]);
    fetchStores(endpoints.store); // Fetch stores from the beginning
    fetchFoods();
    fetchCategories()
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  }, [fetchStores, fetchFoods, fetchCategories]);

  const handleStorePress = (store) => {
    navigation.navigate("StoreShow", { storeId: store.id });
  };

  useEffect(() => {
    setLoading(true);
    fetchStores(endpoints.store).catch((error) => {
      console.error(error);
      setLoading(false);
    });
    fetchFoods().catch((error) => {
      console.error(error);
    });
    fetchCategories().catch((error) => {
      console.error(error);
    });
  }, []);

  const handleSearch = async (query) => {
    if (query.trim() === "") {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setLoading(true);

    try {
      const [foodResponse, storeResponse] = await Promise.all([
        axios.get(endpoints["search-food"](query)),
        axios.get(endpoints["search-store"](query)),
      ]);

      setSearchResults({
        foods: foodResponse.data.results || [],
        stores: storeResponse.data.results || [],
      });
    } catch (error) {
      console.error("Error searching:", error);
      Alert.alert("Error", "Failed to perform search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchQueryChange = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!isSearching) {
      setLoading(true);
      fetchStores(endpoints.store).catch((error) => {
        console.error(error);
        setLoading(false);
      });
      fetchFoods().catch((error) => {
        console.error(error);
      });
      fetchCategories().catch((error) => {
        console.error(error);
      });
    }
  }, [isSearching]);

  const renderSearchResults = () => {
    if (searchResults.foods.length === 0 && searchResults.stores.length === 0) {
      return (
        <Text style={Styles.searchTitle}>
          Không thể tìm thấy cho từ khóa "{searchQuery}"
        </Text>
      );
    }
    return (
      <>
        {searchResults.stores.length > 0 && (
          <View>
            <Text style={Styles.sectionTitle}>Cửa hàng</Text>
            <View style={Styles.resultsContainer}>
              {searchResults.stores.map((store, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleStorePress(store)}
                >
                  <View style={Styles.resultBox}>
                    <Image
                      source={{ uri: store.avatar }}
                      style={Styles.image}
                    />
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={Styles.name}
                    >
                      {store.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {searchResults.foods.length > 0 && (
          <View>
            <Text style={Styles.sectionTitle}>Món ăn</Text>
            <View style={Styles.resultsContainer}>
              {searchResults.foods.map((food, index) => (
                <TouchableOpacity
                key={index}
                onPress={() => handleNavigateToFood(food)}
              >
                  <View style={Styles.resultBox}>
                    <Image source={{ uri: food.image }} style={Styles.image} />
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={Styles.name}
                    >
                      {food.name}
                    </Text>
                    <Text style={Styles.price}>{formatPrice(food.price)}đ</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </>
    );
  };

  const handleCategoryPress = async (category) => {
    const isSelected = selectedCategories.some((cat) => cat.id === category.id);
    let newSelectedCategories;

    if (isSelected) {
      newSelectedCategories = selectedCategories.filter(
        (cat) => cat.id !== category.id
      );
      const newCategoryFoods = { ...categoryFoods };
      delete newCategoryFoods[category.id];
      setCategoryFoods(newCategoryFoods);
    } else {
      newSelectedCategories = [...selectedCategories, category];
      try {
        const response = await axios.get(
          endpoints["food-category"](category.id)
        );
        if (response.data && Array.isArray(response.data.results)) {
          setCategoryFoods((prev) => ({
            ...prev,
            [category.id]: response.data.results,
          }));
        }
      } catch (error) {
        console.error("Error fetching category foods:", error);
        Alert.alert("Error", "Failed to fetch foods for this category.");
      }
    }

    setSelectedCategories(newSelectedCategories);
  };

  const renderCategoryFoods = () => {
    return selectedCategories.map((category) => (
      <View key={category.id}>
        <Text style={Styles.sectionTitle}>Danh mục {category.name}:</Text>
        <View style={Styles.resultsContainer}>
          {categoryFoods[category.id]?.length > 0 ? (
            categoryFoods[category.id].map((food, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleNavigateToFood(food)}
              >
                <View style={Styles.resultBox}>
                  <Image source={{ uri: food.image }} style={Styles.image} />
                  <Text
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={Styles.name}
                  >
                    {food.name}
                  </Text>
                  <Text style={Styles.price}>{formatPrice(food.price)}đ</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={Styles.title}>
              Danh mục này hiện không có món nào !
            </Text>
          )}
        </View>
      </View>
    ));
  };

  return (
    <ImageBackground source={backGround} style={AppStyles.background}>
      <Searchbar
        placeholder="Search"
        onChangeText={handleSearchQueryChange}
        value={searchQuery}
        style={Styles.searchBar}
        onSubmitEditing={() => handleSearch(searchQuery)}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 20
          ) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          <>
            <View style={AppStyles.margintop}>
              <View>
                <Text style={Styles.sectionTitle}>Danh mục</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {categories.map((category) => (
                    <Chip
                      key={category.id}
                      style={{ marginRight: 5, marginBottom: 5 }}
                      mode="outlined"
                      onPress={() => handleCategoryPress(category)}
                      icon={
                        selectedCategories.some((cat) => cat.id === category.id)
                          ? "check"
                          : null
                      }
                    >
                      {category.name}
                    </Chip>
                  ))}
                </View>
              </View>

              {renderCategoryFoods()}

              {isSearching ? (
                <>
                  <Text style={Styles.searchTitle}>Tìm kiếm</Text>
                  {renderSearchResults()}
                </>
              ) : (
                <>
                  <View style={Styles.shortcutbox}>
                    <Text style={[Styles.h1]}>Cửa hàng gần bạn</Text>
                  </View>
                  <ScrollView
                    horizontal={true}
                    style={Styles.xscrollView}
                    showsHorizontalScrollIndicator={false}
                  >
                    {stores.map((store, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleStorePress(store)}
                      >
                        <View style={Styles.itemContainer}>
                          <Image
                            source={{ uri: store.avatar }}
                            style={Styles.image}
                          />
                          <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={[Styles.itemName, Styles.text]}
                          >
                            {store.name.length > 20
                              ? `${store.name.substring(0, 20)}...`
                              : store.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <View style={[Styles.shortcutbox, { marginTop: 15 }]}>
                    <Text style={[Styles.h1]}>Nhũng món ăn ngon</Text>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("ViewFood", { items: foods })
                      }
                    >
                      <Text style={[Styles.button]}>Xem tất cả =&gt;</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    horizontal={true}
                    style={Styles.xscrollView}
                    showsHorizontalScrollIndicator={false}
                  >
                    {foods.map((food, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleNavigateToFood(food)}
                      >
                        <View style={Styles.itemContainer}>
                          <Image
                            source={{ uri: food.image }}
                            style={Styles.image}
                          />
                          <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={[Styles.itemName, Styles.text]}
                          >
                            {food.name.length > 20
                              ? `${food.name.substring(0, 20)}...`
                              : food.name}
                          </Text>
                          <Text style={[Styles.itemPrice]}>
                            {formatPrice(food.price)}đ
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}
            </View>
          </>
        )}
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
