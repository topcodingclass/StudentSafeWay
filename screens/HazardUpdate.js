import React, { useState, useEffect } from 'react'
import { SafeAreaView, View } from 'react-native'
import { doc, updateDoc } from "firebase/firestore";
import { TextInput, Text, Button, IconButton, Icon, Divider, Provider } from 'react-native-paper';
import DropDown from 'react-native-paper-dropdown';
import {db} from '../firebase'

const HazardUpdate = ({navigation, route}) => {
    const { hazard } = route.params;
    const [status, setStatus] = useState('');
    const [showDropDownStatus, setShowDropDownStatus] = useState(false);
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
    const [description, setDescription] = useState('');

    const updateStatusInFirebase = async () => {
            const hazardRef = doc(db, "hazards", hazard.id);
            await updateDoc(hazardRef, {
                status: status,
                hazardMessage: description
            });
            alert("Hazard Updated");
            //GOES BACK
            navigation.navigate('Hazard Display');

    };

    return (
        <Provider>
        <SafeAreaView>
            <View>
                
                <Text>{ hazard.created }</Text>
                <Text>{ hazard.message }</Text>
                <Text>{ hazard.status }</Text>
                <Text>{ hazard.type }</Text>
                
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
                <TextInput
                        label=" Update Description"
                        value={description}
                        onChangeText={setDescription}
                        mode='outlined'
                        multiline
                        style= {{marginTop:10}}
                    />
                
                <Button 
                    mode="contained" 
                    onPress={updateStatusInFirebase}
                    style={{ marginTop: 20 }}
                >
                    Update Status
                </Button>
                
                <Button onPress={() => navigation.navigate('Hazard Display')} icon="map" mode="contained" style={{marginTop: 80}}>
                    View Map
                </Button>
            </View>
        </SafeAreaView>
        </Provider>
    )
    }

export default HazardUpdate
