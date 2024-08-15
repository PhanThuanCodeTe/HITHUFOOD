import { StyleSheet } from "react-native";

export default StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover", // or 'stretch' for a different effect
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 5,
    padding: 5,
  },
  text: {
    color: "Black",
    fontSize: 16,
  },
  itemContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 5,
    padding: 0,
  },
  itemName: {
    fontWeight: "bold",
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
    alignSelf: "center",
    marginBottom: 1,
  },
  itemPrice: {
    fontSize: 18,
    color: "#FF5555",
    marginTop: 5,
    fontWeight: "bold",
    textAlign: "center",
  },
  foodbox: {
    flex: 1,
    padding: 10,
  },
});
