import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView, FlatList } from 'react-native';
import { Text, IconButton, Divider, Button} from 'react-native-paper';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase';

const WalkGroupListScreen = ({navigation}) => {
    const [groups, setGroups] = useState([]);
    useEffect(() => {
        const fetchSuggestions = async () => {
          try {
            const groupsCollection = await getDocs(collection(db, "groups"));
            const groupsList = groupsCollection.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setGroups(groupsList);
          } catch (error) {
            console.error('Error fetching suggestions: ', error);
          }
        };
    
        fetchSuggestions();})

    const renderItem = ({item}) => {
        return (
          <View style={{margin:5}}>
            <View style={{ flexDirection: 'row', margin: 5, alignItems: 'center', justifyContent: "space-between"}}>
            <Text variant="titleMedium"> School: {item.schoolID} </Text>
            <Text variant="titleMedium"> Destination: {item.destination} </Text>
            </View>
            <View style={{ flexDirection: 'row', margin: 5, alignItems: 'center', justifyContent: "space-between"}}>
             <Text>Meeting Time: {item.meetingTime} </Text>
             <Text>Gathering Point:{item.gatheringPoint} </Text>
             </View>
             <Divider/>
            </View>
            
            
        )
    
      }
  return (
    <SafeAreaView style = {{flex:1}}>
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
      <FlatList data={groups} renderItem={renderItem} />
      <View style = {{position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, marginBottom:50 }} >
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