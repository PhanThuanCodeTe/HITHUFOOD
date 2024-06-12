import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get('window');

const Styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 0, // Ensure there's no padding at the top
    justifyContent: "flex-start", // Ensure content is aligned at the top
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Optional: Add a semi-transparent background to improve readability
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    margin:5,
    marginBottom: 16,
    backgroundColor: "white", // Ensure inputs are readable
  },
  imagePicker: {
    alignItems: "center",
    justifyContent: "center",
    height: 150,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 100,
    marginBottom: 15,
    borderColor: 'black',
    borderWidth: 2,
    margin:20,
  },
  message: {
    textAlign: "center",
    alignItems: "center",
    fontSize: 28,
    fontWeight: "bold",
    paddingTop: 5,
    marginBottom: 5,
    color:"green",
  },
  contentshow: { flex: 1, justifyContent: "center", alignItems: "center" },
  h1: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  storename: {
    fontSize: 20,
    fontWeight: "bold",
  },
  foodimage: {
    width: 100,
    height: 100,
    margin: 10,
  },
  box: {
    borderWidth: 1,
    borderColor: "grey",
    margin: 5,
    borderRadius: 5,
    flexDirection: 'row', // Ensure the box content aligns in a row
    alignItems: 'center', // Center the items vertically
    flex: 1, // Allow the box to expand flexibly
  },
  textContainer: {
    flex: 1, // Allow the text container to take up the remaining space
    marginLeft: 10, // Add some space between the image and the text
  },
  foodname: {
    fontSize: 18,
    fontWeight: "bold",
    flexWrap: 'wrap', // Enable text wrapping
  },
  address:{
    fontSize:18,
    margin:5,
  },
  sendbutton:{
    marginTop:5,
    marginBottom:20,
    borderRadius:5,
    fontSize:24,
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 5,
    paddingHorizontal: 5,
    margin: 5,
  },
  overlayinfo: {
    fontSize: 18,
    paddingLeft: 15,
    margin: 5,
  },
  overlay: {
    width: width * 0.8,
    minHeight: height * 0.35,
    padding: 20,
  },
  overlayContent: {
    width: '100%',
  },
  overlaySubTitle: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 10,
  },
  overlayButtonContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 10,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  input: {
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'transparent',
    fontSize: 16,
    padding: 5,
    marginTop: 5,
  },
});

export default Styles;
