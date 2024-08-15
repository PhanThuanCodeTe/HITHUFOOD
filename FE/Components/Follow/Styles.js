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
  storeContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
  },
  storeAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  storeAddress: {
    fontSize: 14,
    color: '#555',
  },
});
