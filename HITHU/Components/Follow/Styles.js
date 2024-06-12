import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";
import { Button } from "react-native-elements";

const screenWidth = Dimensions.get("window").width;
const imageWidth = screenWidth * 0.95;

export default StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover", // or 'stretch' for a different effect
  },
  flex: {
    flex: 1,
  },
  
});
