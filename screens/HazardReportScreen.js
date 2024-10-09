import React, { useState } from 'react';
import { StyleSheet, Image, View, SafeAreaView } from 'react-native';
import { IconButton, Text, TextInput, Button, Provider } from 'react-native-paper';
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, storage, auth } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DropDown from "react-native-paper-dropdown";
import * as ImagePicker from 'expo-image-picker';
import * as Location from "expo-location";

const HazardReportScreen = ({ navigation, route }) => {
  const [showDropDownType, setShowDropDownType] = useState(false);
  const [showDropDownStatus, setShowDropDownStatus] = useState(false);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({});
  const [image, setImage] = useState(null);
  const [imageurl, setImageurl] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  const studentID = auth.currentUser.uid

  const {user} = route.params

  const hazardList = [
    { label: "Traffic-Related", value: "Traffic" },
    { label: "Natural Hazard", value: "Natural" },
    { label: "Violence and Threats", value: "Violence" },
    { label: "Dangerous infrastructure", value: "Infra" },
    { label: "Police activity", value: "Police" },
    { label: "Heavy traffic", value: "Heavy" },
    { label: "Path Closure", value: "Closure" },
  ];

  const hazardStatus = [
    { label: "Unconfirmed", value: "Unconfirmed" },
    { label: "Potential", value: "Potential" },
    { label: "Active", value: "Active" },
    { label: "In-Progress", value: "Progress" },
    { label: "Resolved", value: "Resolved" },
  ];

  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }
      const { coords: { latitude, longitude } } = await Location.getCurrentPositionAsync({});
      setLocation({ latitude, longitude });
      console.log("Location Received: ", latitude, longitude);
    } catch (error) {
      console.error('Error fetching location: ', error);
    }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      console.log(result.assets[0].uri)
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        console.log(result.assets[0].uri)
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image: ', error);
    }
  };

  const uploadImage = async (uri) => {
    console.log('Uploading...');
    try {
      const response = await fetch(uri);
      console.log('fetched')
      const blob = await response.blob();
      console.log('blob made')
      const timestamp = new Date().toISOString().replace(/[:.-]/g, ''); 
      const filename = `${timestamp}_${uri.substring(uri.lastIndexOf('/') + 1)}`;
      console.log('filename made', filename)
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      console.log("image uploaded")
      await fetchLocation();

      console.log('Download URL:', url);
      setImageurl(url);
      console.log('Upload successful');
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload failed');
    }
  };

  const sendHazard = async () => {
    
    try {
      const docRef = await addDoc(collection(db, "hazards"), {
        type: type,
        description: description,
        reportDateTime: Timestamp.fromDate(new Date()),
        status: status,
        locationDescription: location,
        reportedBy: studentID,
        imaguri: imageurl
      });
      console.log("Document written with hazard type: ", type);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <Provider>
      <SafeAreaView>
        
        <View style={{ marginTop: 20, marginHorizontal: 30 }}>
          <DropDown
            label={"Hazard Type"}
            mode={"outlined"}
            visible={showDropDownType}
            showDropDown={() => setShowDropDownType(true)}
            onDismiss={() => setShowDropDownType(false)}
            value={type}
            setValue={setType}
            list={hazardList}
            style={{ marginTop: 40, marginBottom: 50 }}
          />
          <DropDown
            label={"Hazard Status"}
            mode={"outlined"}
            visible={showDropDownStatus}
            showDropDown={() => setShowDropDownStatus(true)}
            onDismiss={() => setShowDropDownStatus(false)}
            value={status}
            setValue={setStatus}
            list={hazardStatus}
            style={{ marginTop: 40, marginBottom: 50 }}
          />
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode='outlined'
            multiline
            style={{ marginTop: 10 }}
          />
          <Button icon="camera" mode="outlined" onPress={pickImage} style={{ marginTop: 10 }}>
            Pick an image from camera roll
          </Button>
          {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
          <Button icon="alert" mode="contained" style={{ marginTop: 20 }} onPress={sendHazard}>
            Report Hazard
          </Button>
          <Button onPress={() => navigation.navigate('Hazard Display')} icon="map" mode="contained" style={{ marginTop: 60 }}>
            View Map
          </Button>
        </View>
      </SafeAreaView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HazardReportScreen;
