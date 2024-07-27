    import React from "react";
    import AppStyles from "../../Styles/AppStyles";
    import Styles from "./Styles";
    import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    FlatList,
    } from "react-native";
    import { useNavigation } from "@react-navigation/native";

    const AllItems = ({ route }) => {
    const { items } = route.params;
    const navigation = useNavigation();

    const handleNavigateToFood = (item) => {
        navigation.navigate("Detail", { item });
    };
    const renderItem = ({ item }) => (
        <TouchableOpacity
        style={Styles.foodbox}
        onPress={() => handleNavigateToFood(item)}
        >
        <View style={Styles.itemContainer}>
            <Image source={{ uri: item.image }} style={Styles.image} />
            <Text numberOfLines={1} ellipsizeMode="tail" style={[Styles.itemName, Styles.text]}>
            {item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name}
            </Text>
            <Text style={[Styles.itemPrice]}>{item.price}đ</Text>
        </View>
        </TouchableOpacity>
    );

    return (
        <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        style={Styles.xscrollView}
        />
    );
    };
    export default AllItems;
