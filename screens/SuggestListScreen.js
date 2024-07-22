import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView, FlatList } from 'react-native';
import { Text, IconButton, Divider,  } from 'react-native-paper';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase';

const SuggestListScreen = () => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const suggestionsCollection = await getDocs(collection(db, "suggestions"));
        const suggestionsList = suggestionsCollection.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSuggestions(suggestionsList);
      } catch (error) {
        console.error('Error fetching suggestions: ', error);
      }
    };

    fetchSuggestions();
  }, []);
  const renderItem = ({item}) => {
    return (
      <View style={{marginTop:3}}>
        <Divider />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 5, alignItems: 'center' }}>
         <Text>Reported: {item.reportedBy} </Text>
          <Text>Status: {item.status} </Text>
          <Text>Date: {item.reportDateTime.toDate().toDateString()}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 5,marginLeft:15, alignItems: 'center' }}>
         <Text> Description: {item.description} </Text>
        </View>
      </View>
    )

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
      <FlatList data={suggestions} renderItem={renderItem} />
    </SafeAreaView>
  )
}


export default SuggestListScreen

const styles = StyleSheet.create({})