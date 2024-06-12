import { color } from '@rneui/base';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 120, // Ensure space for the fixed bottom view
  },
  container: {
    flex: 1,
    padding: 20,
  },
  itemContainer: {
    marginBottom: 20,
  },
  itemNameContainer: {
    marginBottom: 5,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 5,
  },
  itemQuantity: {
    fontSize: 16,
    marginHorizontal: 5,
  },
  itemPrice: {
    fontSize: 16,
    marginLeft: 10,
  },
  emptyMessage: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 20,
    fontWeight:"bold"
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomView: {
    padding: 10,
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "white",
    borderRadius: 5,
    margin: 5,
    marginBottom:15,
  },
  fixedBottomView: {
    position: "absolute",
    bottom: 25,
    left: 0,
    right: 0,
  },
  bottomViewScrolled: {
    marginBottom: 20, // Margin when in scroll view
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: '100%',
    paddingVertical: 5,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addressText:{
    fontSize:18,
    fontWeight:"bold"
  },
  
});
