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
    padding:5,
  },
  h1:{
    fontSize: 21,
    color:"blue",
    fontWeight:'bold',
    marginBottom:5,
  },
  text: {
    color: "Black",
    fontSize: 16,
  },
  searchBar:{
      position: "sticky",
      top: 0,
      zIndex: 100,
  },
  xscrollView: {
    flexDirection: "row",
  },
  itemContainer: {
    width: 200,
    marginRight: 5, // Adjust the spacing between items if needed
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
    marginBottom: 5,
  },
  specialbox:{
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 5,
    padding: 5,
  },
  itemPrice:{
    fontSize: 18,
    color: "#FF5555",
    marginTop: 5,
    fontWeight:"bold",
    textAlign:"center",
  },
  button:{
    fontSize: 16,
    marginRight: 10,
  },
  shortcutbox:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  
});
