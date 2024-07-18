import { View, SafeAreaView, FlatList, TouchableOpacity} from "react-native"
import React, { useState, useEffect } from 'react'
import { TextInput, Text, Button, IconButton, Icon, Divider } from 'react-native-paper';
import { collection, addDoc, Timestamp, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { FirebaseError } from "firebase/app";
import MapView from 'react-native-maps';

// TO DO
// 1. GET IT TO GET STUFF FROM FIREBASE 
// 2. RENDER
// 3. RELOAD EVERY UPDATE

const HazardDisplayTest = ({ navigation }) => {
    //hazards list
    const [hazards, setHazards] = useState([])
    //updates hazards list from firebase
    useEffect(() => {
        //onSnapshot detects changes in  real time and calls a function with the updated querySnapshot
        const unsubscribe = onSnapshot(collection(db, "hazards"), (querySnapshot) => {
            const hazardFromDB = [];
            //querySnapshot has all the hazards
            //forEach goes through eah hazard and extracts the necessary data
            querySnapshot.forEach((doc) => {
                const hazard = {
                    id: doc.id,
                    message: doc.data().hazardMessage,
                    status: doc.data().status,
                    created: doc.data().createdDateTime.toDate().toDateString(),
                    type: doc.data().hazardType
                };
                hazardFromDB.push(hazard);
            });
            //updated hazards with new data
            setHazards(hazardFromDB);
        });
            return () => unsubscribe();
        }, []);

    {/* we got item as essentially a "for i in" type deal when doing renderItem in the entire list of hazards */}
    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={()=>{navigation.navigate('Hazard Update', {hazard: item})}}>
                <View style = {{marginTop: 7}}>
                    <Text>Created: {item.created}</Text>
                    <Text>Hazard: {item.message}</Text>
                    <Text>Status: {item.status}</Text>
                </View>
            </TouchableOpacity>
        )
    }
    
    return (
        <SafeAreaView style = {{margin:10}}>
            <View style = {{height: 200}}>
                <Text>School Alerts: </Text>
                
            </View>
            <View>

                <MapView style={{width:"100%", height:"60%"}} />
                <FlatList data={hazards} renderItem={renderItem} keyExtractor = {item => item.id} style = {{flex: 1}} />
            </View>
            <View style = {{flexDirection: 'row', justifyContent: 'space-between', marginTop: 1}}>
                    <Button onPress={() => navigation.navigate('Hazard Report')} icon="alert" mode="contained" style={{flex: 1}}>
                        Report Hazard
                    </Button>
                    <Button icon="walk" mode="contained" style={{flex: 1}}>
                        Join Walk Group
                    </Button>
                </View>
        </SafeAreaView>
    )
    }

export default HazardDisplayTest
