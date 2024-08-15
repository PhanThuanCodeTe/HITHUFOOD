import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: '80%',
  },
  h1: {
    fontSize: 24,
    color: "red",
    fontWeight: 'bold',
  },
  text: {
    color: "green",
    fontSize: 24,
  },
  image: {
    width: 225,
    height: 225,
    resizeMode: "cover",
    alignSelf: "center",
    marginBottom: 5,
  },
  Button: {
    fontSize: 25,
  },
  title: {
    textAlign: "center",
    alignItems: "center",
    fontSize: 28,
    fontWeight: "bold",
    paddingTop: 5,
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAccountText: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
    color: 'gray',
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
  switchText: {
    fontSize: 16,
    color: 'blue',
    marginLeft: 5,
  },
  margin: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  overlayavatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    textAlign: "center",
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
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10
  },
  genderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  genderLabel: {
    marginRight: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxContainer: {
    backgroundColor: "transparent",
    borderWidth: 0,
    margin: 0,
    padding: 0,
  },
  checkboxText: {
    fontWeight: "normal",
    fontSize: 18,
  },
  genderText: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  inputContent: {
    width: '100%',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: 'transparent',
    fontSize: 18,
    padding: 2,
  },
  userInfoContainer: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20
  },
  infoBox: {
    width: '95%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
  },
  changeButton: {
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
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
    margin: 5,
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
  listItemTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
  },
  addressContainer: {
    width: '95%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 5,
  },
  addButtonContainer: {
    alignItems: 'center',
    marginTop: 10, // Adjust spacing as needed
  },
  addButton: {
    backgroundColor: 'blue', // Example background color
    color: 'white', // Example text color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    fontSize: 16,
  },
  address:{
    fontSize:18,
    margin:5,
  },
});
