import { StyleSheet, View, SafeAreaView} from 'react-native'
import {useState} from 'react'
import {Text, IconButton, Divider, TextInput, Button} from 'react-native-paper'
import React from 'react'
import { collection, addDoc, Timestamp} from "firebase/firestore"; 
import {db} from '../firebase'


const SOSScreen = (navigation) => {
    const [message, setMessage] = useState('')

    const school = {studentid:'1', schoolID:'aaa'}

    const sendSOS = async () => {
        try {
            const docRef = await addDoc(collection(db, "help messsages"), {
              schoolID: school.schoolID,
              message: message,
              createdDateTime: Timestamp.fromDate(new Date()),
              createdBy:school.studentid
            });
            console.log("Document written with ID: ", docRef.id);
            
          } catch (e) {
            console.error("Error adding document: ", e);
          }
        }
        const makeCall = (number) => {
            let phoneNumber = '';
            if (Platform.OS === 'android') {
              phoneNumber = `tel:${number}`;
            } else {
              phoneNumber = `telprompt:${number}`;
            }
            console.log(phoneNumber)
            Linking.canOpenURL(phoneNumber)
              .then((supported) => {
                if (!supported) {
                  Alert.alert('Phone number is not available');
                } else {
                  return Linking.openURL(phoneNumber);
                }
              })
              .catch((err) => console.log(err));
          };
        return (
            <SafeAreaView>
                {/*Body*/}
              <View style={{marginTop:20, marginHorizontal:5}}>
              <Text variant="titleMedium" style={{alignSelf:'center', marginBottom:20}}>Send Help Message</Text>
              {/*Buttons*/}
              <View style = {{flexDirection:'row', marginHorizontal:50, justifyContent:'space-between'}}>
              <Button mode="outlined" onPress={()=>makeCall('911')} >Call 911</Button>
              <Button mode = "outlined" onPress={()=>makeCall('9497247000')} >Call IPD</Button>
              </View>
              {/*Input for message*/}
              <TextInput
              label="Message"
              value={message}
              onChangeText={setMessage}
              mode='outlined'
              multiline
            />
              {/*Button*/}
              <View style={{flexDirection:'row', justifyContent:'space-between', marginHorizontal:5}}>
              <Button style={{marginTop:50}} icon = "alert" mode="outlined" onPress={() => sendSOS()} >
                    
                    Send Help Message
              </Button>
              <Button style={{ marginTop: 50 }} mode="outlined" onPress={() => sendSOSAndCall('911')}>
                        Send Message and Call 911
                    </Button>
              </View>

              </View>
           </SafeAreaView>
          )
        }
        
        export default SOSScreen
        
        const styles = StyleSheet.create({})
