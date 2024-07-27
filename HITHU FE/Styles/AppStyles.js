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
  },
  text: {
    backgroundColor: "transparent",
    fontSize: 25,
    color: "green",
  },
  row: {
    flexDirection: "row",
  },
  wrap: {
    flexWrap: "wrap",
  },
  margin: {
    margin: 5,
  },
  margintop: {
    marginTop: 5,
  },
  avatar: {
    width: 80,
    height: 80,
  },
  button: {
    padding: 15,
    alignItems: "center",
    borderRadius: 5,
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  flex:{
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingRight: 5,
  },
});
