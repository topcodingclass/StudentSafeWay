import { SafeAreaView, StyleSheet, View, TouchableOpacity} from 'react-native'
import { useState } from 'react'
import { Text, IconButton, Divider, Provider, Button } from 'react-native-paper'
import React from 'react'
import DropDown from "react-native-paper-dropdown";
import {db} from '../firebase'
import { collection, addDoc} from "firebase/firestore"; 

const WalkGroupCreateScreen = ({navigation}) => {
  const newSpot = () => {
    console.log('Pressed');
  }
  const newTime = () => {
    console.log('Pressed');
  }

  const [destination, setDestination] = useState('')
  const [gatheringpoint, setGatheringPoint] = useState('')
  const [meetingtime, setMeetingTime] = useState('')
  const [showDropDownDestination, setShowDropDownDestination] = useState(false);
  const [showDropDownGathering, setShowDropDownGathering] = useState(false);
  const [showDropDownMeeting, setShowDropDownMeeting] = useState(false);

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

  const gatheringList = [
    {
      label: "First Spot",
      value: "First Spot"
    },
    {
      label: "Second Spot",
      value: "Second Spot"
    }
  ]
  const meetingList = [
    {
      label:"First Time",
      value:"First Time"
    },
    {
      label: "Second Time",
      value: "Second Time"
    }
  ]
  const school = {id:'2', schoolID:'bbb'}

  const addGroups = async () => {
    try {
        const docRef = await addDoc(collection(db, "groups"), {
          schoolID: school.schoolID,
          destination:destination,
          meetingTime:meetingtime,
          gatheringPoint:gatheringpoint
        });
        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }

  return (
    <Provider>
      <SafeAreaView style = {{margin:10}}>
        {/*Header*/}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
          <Text variant="labelLarge">Hello Scooby Doo</Text>
          <Text variant="labelLarge">15 Degree Sunny</Text>
          <IconButton
            icon="account"
            size={20}
            onPress={() => console.log('Pressed')}
          />
        </View>
        <Divider />
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
          style={{ marginTop: 40, marginBottom: 50 }}
        />
        <DropDown
          label={"Gathering Point"}
          mode={"outlined"}
          visible={showDropDownGathering}
          showDropDown={() => setShowDropDownGathering(true)}
          onDismiss={() => setShowDropDownGathering(false)}
          value={gatheringpoint}
          setValue={setGatheringPoint}
          list={gatheringList}
          style={{ marginTop: 40, marginBottom: 50 }}
        />
        <TouchableOpacity onPress={newSpot} style={styles.textButton}>
          <Text style={styles.textButtonText}>Create A New Spot</Text>
        </TouchableOpacity>
        <DropDown
          label={"Meeting Time"}
          mode={"outlined"}
          visible={showDropDownMeeting}
          showDropDown={() => setShowDropDownMeeting(true)}
          onDismiss={() => setShowDropDownMeeting(false)}
          value={meetingtime}
          setValue={setMeetingTime}
          list={meetingList}
          style={{ marginTop: 40, marginBottom: 50 }}
        />
         <TouchableOpacity onPress={newTime} style={styles.textButton}>
          <Text style={styles.textButtonText}>Set A New Time</Text>
        </TouchableOpacity>

        <Button style={{marginTop:40}}icon="account-multiple-plus" mode="outlined" onPress={() => addGroups()}>
            Create Walk Group
      </Button>
      <Button style={{marginTop:40}} 
      mode="outlined"
      onPress={() => navigation.navigate('List Group')}
  >
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
