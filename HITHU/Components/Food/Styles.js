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
  container: {
    flex: 1,
    borderRadius: 5,
    padding: 0,
  },
  discount: {
    color: "#FF5555",
    fontSize: 16,
  },
  name: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
  },
  image: {
    width: imageWidth,
    height: 200,
  },
  imagecontainer: { alignItems: "center" },
  showrow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingRight: 5,
  },
  showprice: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  h2: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 15,
  },
  ratingcontainer: {
    alignSelf: "flex-start",
  },
  showquantity: {
    marginHorizontal: 10,
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },
  cancelororder:{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  buttoncancel:{ backgroundColor: 'grey', paddingLeft:20, paddingRight:20 },
  buttonorder:{ backgroundColor: '#60D160', paddingLeft:20, paddingRight:20 },
  buttonaddorder:{
    backgroundColor: "#60D160",
    borderRadius: 5,
    padding:15,
    marginRight:10
  },
});
