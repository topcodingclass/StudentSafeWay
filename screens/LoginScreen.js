import { StyleSheet, View, SafeAreaView, Image, Dimensions } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from '../firebase';
import { setDoc, doc } from "firebase/firestore"; 

const LogInScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginFailed, setLoginFailed] = useState(false); // State to track login status

  let isFromSignUp = false;
  isFromSignUp = route?.params?.isFromSignUp ?? false;

  // Get screen width
  const screenWidth = Dimensions.get('window').width;

  // Test login: student6@gmail.com
  const logIn = async () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const userId = userCredential.user;
        // ...
        navigation.navigate('Main');
        setLoginFailed(false);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);
        setLoginFailed(true);
      });
  };

  return (
    <View style={{ flex: 1}}>
      <Image
        source={require("../assets/logo.png")}
        style={[styles.logo, { width: screenWidth, height: screenWidth }]} // Set width and height dynamically
      />
      {loginFailed && ( // Render the error message when login fails
        <View>
          <Text style={styles.errorText}>Login failed. Please try again.</Text>
        </View>
      )}
      {isFromSignUp && ( // Render the message for successful sign up
        <Text style={{ fontSize: 16, color: '#3c763d', margin: 10 }}>
          Congratulations! You have signed up successfully, please login.
        </Text>
      )}
      <View style={{marginVertical:50, marginHorizontal:5}}>
      <TextInput style={styles.input} label="Email" autoCapitalize='none' value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} label="Password" autoCapitalize='none' value={password} onChangeText={setPassword} secureTextEntry />
      </View>
      <View style={{ marginTop: 30, marginHorizontal: 20 }}>
        <Button icon="login-variant" mode="contained" onPress={logIn}>
          Log In
        </Button>
        <Button style={{ marginVertical: 10 }} icon="clipboard-account-outline" mode="contained" onPress={() => navigation.navigate('Register')}>
          Sign Up
        </Button>
      </View>
    </View>
  );
};

export default LogInScreen;

const styles = StyleSheet.create({
  input: { backgroundColor: 'white', marginVertical: 3 },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  logo: {
    marginBottom: 20,
    alignSelf: 'center'
  },
});
