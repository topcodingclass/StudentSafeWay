import { SafeAreaView, StyleSheet, View, TouchableOpacity} from 'react-native'
import { useState, useEffect} from 'react'
import { Text, IconButton, Divider, Provider, Button, TextInput } from 'react-native-paper'
import React from 'react'
import DropDown from "react-native-paper-dropdown";
import {db, auth} from '../firebase'
import { collection, addDoc} from "firebase/firestore"; 
import axios from 'axios';

const WalkGroupCreateScreen = ({navigation}) => {
  const [destination, setDestination] = useState('')
  const [types, setTypes] = useState('')
  const [groupName, setgroupName] = useState('')
  const [gatheringPointName, setGatheringPointName] = useState('')
  const [gatheringPointAddress, setGatheringPointAddress] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [showDropDownDestination, setShowDropDownDestination] = useState(false);
  const [showDropDownType, setShowDropDownType] = useState(false); // New state for types dropdown

  const destinationList = [
    {
      label: "To School",
      value: "To School"
    },
    {
      label: "From School",
      value: "From School"
    }
  ]

  const typeList = [
    {
      label: "Walk",
      value: "Walk"
    },
    {
      label: "Bike",
      value: "Bike"
    },
    {
      label: "Ebike",
      value: "Ebike"
    }
  ]
  const school = {id: '2', schoolID: 'bbb'}

  const addGroups = async () => {
    try {
      // Geocode gatheringPointAddress to get lat/lng
      const apiKey = 'AIzaSyAwZ14E06iyM-L465xhMqZlLltS_FNJEjY';
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: gatheringPointAddress,
          key: apiKey,
        }
      });
  
      // Extract latitude and longitude from the response
      const location = response.data.results[0].geometry.location;
      const gatheringPointGeoCode = {
        lat: location.lat,
        lng: location.lng,
      };

      // Add the document with the geo-coordinates
      const docRef = await addDoc(collection(db, "groups"), {
        schoolID: school.schoolID,
        name: groupName,
        destination: destination,
        meetingTime: meetingTime,
        gatheringPointName: gatheringPointName,
        gatheringPointAddress: gatheringPointAddress,
        gatheringPointGeoCode: gatheringPointGeoCode,
        type: types, // Add the selected type here
      });
  
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };
     
  return (
    <Provider>
      <SafeAreaView style={{margin:10}}>
        <View style={{ marginTop: 20, marginHorizontal: 5 }}>
          <Text variant="titleLarge" style={{ alignSelf: 'center', marginBottom: 20, marginTop: 20 }}>Create a Walk Group</Text>
        </View>

        <DropDown
          label={"Destination"}
          mode={"outlined"}
          visible={showDropDownDestination}
          showDropDown={() => setShowDropDownDestination(true)}
          onDismiss={() => setShowDropDownDestination(false)}
          value={destination}
          setValue={setDestination}
          list={destinationList}
          style={{ marginTop: 40, marginBottom: 20 }}
        />

        <DropDown
          label={"Type"}
          mode={"outlined"}
          visible={showDropDownType}
          showDropDown={() => setShowDropDownType(true)}
          onDismiss={() => setShowDropDownType(false)}
          value={types}
          setValue={setTypes}
          list={typeList}
          style={{ marginTop: 20, marginBottom: 50 }}
        />

        <TextInput
          label="Group Name"
          value={groupName}
          onChangeText={setgroupName}
          mode='outlined'
          multiline
        />
        <TextInput
          label="Gathering Point Name"
          value={gatheringPointName}
          onChangeText={setGatheringPointName}
          mode='outlined'
          multiline
        />
        <TextInput
          label="Gathering Point Address"
          value={gatheringPointAddress}
          onChangeText={setGatheringPointAddress}
          mode='outlined'
          multiline
        />
        <TextInput
          label="Meeting Time"
          value={meetingTime}
          onChangeText={setMeetingTime}
          mode='outlined'
          multiline
        />

        <Button style={{ marginTop: 40 }} icon="account-multiple-plus" mode="outlined" onPress={() => addGroups()}>
          Create Walk Group
        </Button>

        <Button style={{ marginTop: 40 }} mode="outlined" onPress={() => navigation.navigate('Walk Group List')}>
          List of Walk Groups
        </Button>
      </SafeAreaView>
    </Provider>
  )
}

export default WalkGroupCreateScreen

const styles = StyleSheet.create({
  textButton: {
    marginTop: 20,
    marginLeft: 200,
    alignItems: 'center',
  },
  textButtonText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
})
