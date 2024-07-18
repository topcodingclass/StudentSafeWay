// TODO: 
// MAKE PHOTOS BE PUT INTO STORAGE RATHER THAN FILE URL
    // https://console.firebase.google.com/u/0/project/studentsafeway-e4ffd/storage 
// Look into dropdown
    //https://www.npmjs.com/package/react-dropdown 

import { StyleSheet, Image, View, SafeAreaView} from 'react-native'
import { useState} from 'react'
import { IconButton, Text, Divider, TextInput, Button, Provider } from 'react-native-paper';
import { collection, addDoc, Timestamp } from "firebase/firestore"; 
import {db} from '../firebase'
// TRY THIS INSTEAD: https://www.npmjs.com/package/react-dropdown 
import DropDown from "react-native-paper-dropdown";
// IMAGE STORAGE
import * as ImagePicker from 'expo-image-picker';
import * as Location from "expo-location"; 

const MakeHazardReportScreen = ( {navigation} ) => {
    const [showDropDownType, setShowDropDownType] = useState(false);
    const [showDropDownStatus, setShowDropDownStatus] = useState(false);
    //instance variables
    const [type, setType] = useState('');
    const [status, setStatus] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [image, setImage] = useState(null);


    //list of hazards
    const hazardList = [
        {
            label: "Traffic-Related" ,
            value: "Traffic"
        },
        {
            label: "Natural Hazard" ,
            value: "Natural"
        },
        {
            label: "Violence and Threats" ,
            value: "Violence"
        },
        {
            label: "Dangerous infrastructure" ,
            value: "Infra"
        },
        {
            label: "Police activity" ,
            value: "Police"
        },
        {
            label: "Heavy traffic",
            value: "Heavy"
        },
        {
            label: "Path Closure",
            value: "Closure"
        },
    
    ]
    //list of hazard status
    const hazardStatus = [
        {
            label: "Unconfirmed" ,
            value: "Unconfirmed"},
        {
            label: "Potential" ,
            value: "Potential"
        },
        {
            label: "Active" ,
            value: "Active"
        },
        {
            label: "In-Progress" ,
            value: "Progress"
        },
        {
            label: "Resolved" ,
            value: "Resolved"
        }
    ]
    //SEND HAZARD TO FIREBASE
    const sendHazard = async () => {
        fetchLocation
        try {
          const docRef = await addDoc(collection(db, "hazards"), {
            hazardType: type,
            hazardMessage: description,
            createdDateTime: Timestamp.fromDate(new Date()),
            status: status,
            location: location,
            image: image
          });
          console.log("Document written with hazard type: ", type);
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      } 
    
    // Function to fetch the user's location 
	const fetchLocation = async () => { 
		await Location.requestForegroundPermissionsAsync(); 

		const { 
			coords: { latitude, longitude }, 
		} = await Location.getCurrentPositionAsync({}); 
		setLocation({ latitude, longitude }); 
        console.log("Location Recieved: " + latitude + longitude); 
	}; 


    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
    
        console.log(result);
    
        if (!result.canceled) {
          setImage(result.assets[0].uri);
        }
      };


    return (
        <Provider>
            <SafeAreaView>
                {/* Header */}
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-evenly'}}>
                    <Text variant="labelLarge">Hello Scooby Doo!</Text>
                    {/* To do: Get real weather data */}
                    <Text variant="labelLarge">15 degrees, Sunny</Text>
                    <IconButton
                        icon="account"
                        size={20}
                        onPress={() => console.log('Pressed')}
                    />
                </View>
                {/* Title of Screen */}
                <View style={{marginTop:20, marginHorizontal:30}}>
                    <Text variant="titleMedium" style={{alignSelf:'center', marginBottom: 20}}>Report Hazard</Text>
                {/* Dropdowns */}
                    <DropDown
                        label = {"Hazard Type"}
                        mode = {"outlined"}
                        visible={showDropDownType}
                        showDropDown={() => setShowDropDownType(true)}
                        onDismiss={() => setShowDropDownType(false)}
                        value={type}
                        setValue={setType}
                        list={hazardList}
                        style={{marginTop: 40, marginBottom: 50}}
                    />
                    <View style={{marginTop:10}} />
                    {/* POTENTIAL: Segmented Button */}
                    <DropDown
                        label = {"Hazard Status"}
                        mode = {"outlined"}
                        visible={showDropDownStatus}
                        showDropDown={() => setShowDropDownStatus(true)}
                        onDismiss={() => setShowDropDownStatus(false)}
                        value={status}
                        setValue={setStatus}
                        list={hazardStatus}
                        style={{marginTop: 40, marginBottom:50}}
                    />
                {/* Description Box */}
                    <TextInput
                        label="Description"
                        value={description}
                        onChangeText={setDescription}
                        mode='outlined'
                        multiline
                        style= {{marginTop:10}}
                    />
                {/* TODO: Image Upload - https://docs.expo.dev/versions/latest/sdk/imagepicker/ */}
                <Button icon="camera" mode="outlined" onPress={pickImage} style={{marginTop:10}}>
                    Pick an image from camera roll
                </Button>
                {/* {image && <Image source={{ uri: image }}/>} */}
                {/* Location */}
                    {/* https://docs.expo.dev/versions/latest/sdk/location/?redirected  */}
                    {/* TODO: Add an auto location - https://www.geeksforgeeks.org/create-a-location-sharing-app-using-react-native/ */}
                {/* Submit Button */}
                <Button icon="alert" mode="contained" style={{marginTop: 20}} onPress={() => sendHazard()}>
                    Report Hazard
                </Button>
                <Button onPress={() => navigation.navigate('Hazard Display')} icon="map" mode="contained" style={{marginTop: 60}}>
                    View Map
                </Button>
                </View>
            </SafeAreaView>
        </Provider>
  )
}

export default MakeHazardReportScreen
