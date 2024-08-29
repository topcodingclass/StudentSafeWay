import { SafeAreaView, StyleSheet, View } from 'react-native'
import {useState} from 'react'
import {Text, IconButton, Divider, TextInput, Button, RadioButton} from 'react-native-paper'
import React from 'react'
import {db} from '../firebase'
import { collection, addDoc, Timestamp} from "firebase/firestore"; 
import * as Location from "expo-location";

const SuggestAddScreen = () => {
    const [description, setDescription] = useState('')
    const [status, setStatus] = useState('submitted')
    const [location, setLocation] = useState('')

const school = {studentid:'2', schoolID:'bbb'}

const addSuggestion = async () => {
    try {
        const docRef = await addDoc(collection(db, "suggestions"), {
          schoolID: school.schoolID,
          description: description,
          reportDateTime: Timestamp.fromDate(new Date()),
          reportedBy:school.studentid,
          location:location,
          status: status
        });
        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }



  return (
    <SafeAreaView>
      {/*Header*/}  
      <View style ={{flexDirection:'row',alignItems:'center',justifyContent:'space-evenly'}}>
      <Text variant="labelLarge">Hello Scooby Doo</Text>
      
        <Text variant="labelLarge">15 Degree Sunny</Text>
       <IconButton
            icon="account"
            size={20}
            onPress={() => console.log('Pressed')}
        />
      </View>
      <Divider />
     {/*Body*/}
     <View style={{marginTop:20, marginHorizontal:5}}>
      <Text variant="titleLarge" style={{alignSelf:'center', marginBottom:20, marginTop:20}}>Route Improvement Suggestions</Text>
    </View>
    <TextInput
      label="Description:"
      value={description}
      onChangeText={setDescription}
      mode='outlined'
      multiline
      style={{
        height: 80,
        margin: 10, 
      }}

    />
    <TextInput
    label="Location"
    value={location}
    onChangeText={setLocation}
    mode="outlined"
      style={{
        margin:10
      }}
    />
    <RadioButton.Group onValueChange={setStatus} value={status}>
            <View style={{flexDirection: 'row', justifyContent: 'space-around', margin: 15}}>
                    <RadioButton.Item label="Submitted" value="submitted" />
                    <RadioButton.Item label="Reviewing" value="reviewing" />
                    <RadioButton.Item label="Accepted" value="accepted" />
                    <RadioButton.Item label="Declined" value="declined" />
                </View>
            </RadioButton.Group>
    <Button style={{marginTop:40}}icon="email" mode="outlined" onPress={() => addSuggestion()}>
            Submit To School
      </Button>
    </SafeAreaView>
  )
}

export default SuggestAddScreen

const styles = StyleSheet.create({})
