import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView, FlatList, TouchableOpacity} from 'react-native';
import { Text, IconButton, Divider, Button} from 'react-native-paper';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';

const WalkGroupListScreen = ({navigation}) => {
    const [groups, setGroups] = useState([]);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const markers = [
      {
        id: 1,
        title: 'Location 1',
        coordinates: { latitude: 37.78825, longitude: -122.4324 },
      },
      {
        id: 2,
        title: 'Location 2',
        coordinates: { latitude: 37.75825, longitude: -122.4524 },
      },
      {
        id: 3,
        title: 'Location 3',
        coordinates: { latitude: 37.76825, longitude: -122.4424 },
      },
    ];
    useEffect(() => {
        const fetchGroups = async () => {
          try {
            const groupsCollection = await getDocs(collection(db, "groups"));
            const groupsList = groupsCollection.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setGroups(groupsList);
          } catch (error) {
            console.error('Error fetching groups: ', error);
          }
        };
    
        fetchGroups();},[])

    const renderItem = ({item}) => {
        return(
        <TouchableOpacity 
        onPress={() => navigation.navigate('View Detail', { group: item })}>
          <View style={{margin:5}}>
            <View style={{ flexDirection: 'row', margin: 5, alignItems: 'center', justifyContent: "space-between"}}>
            <Text variant="titleMedium"> Name: {item.name} </Text>
            <Text variant="titleMedium"> Destination: {item.destination} </Text>
            </View>
            <View style={{ flexDirection: 'row', margin: 5, alignItems: 'center', justifyContent: "space-between"}}>
             <Text>Meeting Time: {item.meetingTime} </Text>
             <Text>Gathering Point:{item.gatheringPoint} </Text>
             </View>
             <Divider/>
            </View>
            </TouchableOpacity>
        
        )
      }
  return (
    <SafeAreaView style = {{flex:1}}>
      <FlatList data={groups} renderItem={renderItem} />
      <View style = {{position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, marginBottom:2 }} >
      <Button
                icon="plus"
                mode="outlined"
                onPress={() => navigation.navigate('Create Group')}
            >
                Create New Walk Group
            </Button>
            </View>
    </SafeAreaView>
  )

  }
export default WalkGroupListScreen

const styles = StyleSheet.create({})
