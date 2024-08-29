import { StyleSheet, View, SafeAreaView} from 'react-native'
import {Text, TextInput,Button} from 'react-native-paper'
import React, {useState, useEffect} from 'react'
import { createUserWithEmailAndPassword } from "firebase/auth";
import {db, auth} from '../firebase'
import {collection, setDoc, doc, getDocs, query} from "firebase/firestore"; 
import { Picker } from '@react-native-picker/picker';



const RegisterScreen = ({navigation}) => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [address, setAddress] = useState("")
    const [city, setCity] = useState("")
    const [zip, setZip] = useState("")
    const [schools, setSchools] = useState([])
    const [school, setSchool] = useState(" ")
    

    useEffect(() => {
        const fetchSchools = async () => {
          try {
            const querySnapshot = await getDocs(collection(db, "schools"));
            const docsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setSchools(docsData)
          } catch (error) {
            console.error("Error fetching schools: ", error);
          }
        };
    
        fetchSchools();
      }, []);
    const signUp = async () => {
        console.log("sign up started")
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            const userId = userCredential.user.uid;
            console.log(userId)
            setDoc(doc(db, 'students', userId), {
                //schoolName:schoolName,
                schoolID:school,
                name: name,
                address: address,
                city: city,
                zip: zip,
                phone: phone,
                email: email
            });
            
            navigation.navigate('Login')
            
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage)
        });
    }
     

  return (
    <SafeAreaView style={{flex:1, padding:15,}}>
    {/* School Picker */}
<View style={{ marginVertical: 10 }}>
<Picker
  selectedValue={school}
  onValueChange={(itemValue, itemIndex) => setSchool(itemValue)}
>
    {/* Placeholder Item */}
    <Picker.Item label="Select School" value={null} />
  {schools.map((school) => (
    <Picker.Item key={school.id} label={school.name} value={school.id} />
  ))}
</Picker>
</View>
      <TextInput style={styles.input} label="Email" value={email} onChangeText={setEmail} autoCapitalize='none'/>
      <TextInput style={styles.input} label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize='none'/>
      <TextInput style={styles.input} label="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} label="Address" value={address} onChangeText={setAddress} />     
      <TextInput style={styles.input} label="City" value={city} onChangeText={setCity} /> 
      <TextInput style={styles.input} label="Zip" value={zip} onChangeText={setZip} /> 
      <TextInput style={styles.input} label="Phone" value={phone} onChangeText={setPhone} />
      
      <View style={{marginTop:30, marginHorizontal:20}}>
      <Button icon="clipboard-account-outline" mode="contained" onPress={signUp}>
                Sign Up
      </Button>  
      <Button icon="login" style={{marginTop:5}}mode="contained" onPress={() => { navigation.navigate('Login') }}>
          Go to Login
      </Button>
      </View>
    </SafeAreaView>
  )
}

export default RegisterScreen

const styles = StyleSheet.create({
    input:{backgroundColor:'white', marginVertical:3}
})
