import { StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const boxWidth = (width - 40) / 2;

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
  title:{
    fontSize:20,
    fontWeight:"bold",
    margin:5,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  storeImage: {
    width: 130,
    height: 130,
    resizeMode: 'cover',
    borderRadius: 75,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  storeNameContainer: {
    borderBottomWidth: 2,
    borderBottomColor: 'green',
    marginLeft: 10,
    flex: 1,  // Allow the container to take up the available space
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoContainer: {
    padding: 15,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    flex: 1,  // Allow the address to take up available space
  },
  mapButton: {
    padding: 10,
    backgroundColor: 'white',  // Set button background color
  },
  storeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  foodContainer: {
    padding: 15,
  },
  foodTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  foodBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  foodInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  foodDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  foodPrice: {
    fontSize: 16,
    color: 'gray',
    fontWeight:"bold"
  },
  foodDescription: {
    marginTop: 5,
    fontSize: 14,
  },
  noFoodText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  searchTitle:{
    fontSize:24,
    fontWeight:"bold",
    margin:10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 5,
  },
  resultsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 5,
  },
  resultBox: {
    width: boxWidth,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150, // Fixed height for all images
    resizeMode: 'cover',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
    padding: 5,
  },
  price: {
    color: 'red',
    fontSize: 14,
    padding: 5,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1000,
    width: '100%',
    height: '100%',
  },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'white',
  },
  closeButton: {
    marginRight: 10,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  overlayImage: {
    width: '100%',
    height: 200, // or whatever height you prefer
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  overlayImage1: {
    width: '100%',
    height: 200,
  },
  overlayFoodName: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 10,
  },
  overlayDescription: {
    padding: 15,
  },
  overlayPrice: {
    padding: 10,
    fontWeight: 'bold',
  },
  overlayContent: {
    flexGrow: 1,
  },
  overlayToppingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  toppingName:{
    fontSize:18,
    fontWeight:"bold",
  },
  overlayToppingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },

  toppingPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  addButton: {
    marginLeft: 10,
    backgroundColor:"#DFDFDF",
    padding: 5,

  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:"center",
    padding:10,
    margin:10,
  },
  quantityLabel:{
    fontSize:18,
    fontWeight:"bold",
  },
  quantityButtonGroup:{
    flexDirection:"row",
    alignItems:"center"
  },
  orderButtonContainer:{

  },
  iconContainerStyle:{
    marginLeft:10,
    marginRight:10,
  },
  quantityButton:{
    padding:5,
    backgroundColor:"#DFDFDF",
    margin:5,
  },
  quantityText:{
    fontSize:20,
    fontWeight:"bold"
  },
  tabheight:{ height: height * 0.5 },
  commentBox:{
    margin:5,
    padding:10,
  },
  commentTitle:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent: "space-between",
  },
  reviewImage: {
    width: '60%',
    aspectRatio: 16 / 9,
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  reviewImageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '20%',
  },
  fullScreenImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensure it's above other elements
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
    width: '90%',
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  reviewButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  reviewname:{
    fontSize:20,
    fontWeight:"bold",
  },
});
