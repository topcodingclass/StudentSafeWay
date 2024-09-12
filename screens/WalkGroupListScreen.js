import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Text, IconButton, Divider, Button } from 'react-native-paper';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';

const WalkGroupListScreen = ({ navigation }) => {
  const [groups, setGroups] = useState([]);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [markers, setMarkers] = useState([]);


  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupsCollection = await getDocs(collection(db, "groups"));
        const groupsList = groupsCollection.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log(groupsList)
        setGroups(groupsList);
        // Generate markers from groupsList
        const markersList = groupsList.map(group => ({
          id: group.id,
          title: group.gatheringPointName,
          coordinates: {
            latitude: group.gatheringPointGeoCode.lat,
            longitude: group.gatheringPointGeoCode.lng,
          },
        }));

        setMarkers(markersList);
      } catch (error) {
        console.error('Error fetching groups: ', error);
      }
    };

    const getCurrentLocation = async () => {
      {
        // let { status } = await Location.requestForegroundPermissionsAsync();
        // if (status !== 'granted') {
        //   setErrorMsg('Permission to access location was denied');
        //   return;
        // }

        // let location = await Location.getCurrentPositionAsync({});
        // setLocation(location);
        //for testing
        // Manually set location for testing
    const testLocation = {
      coords: {
        latitude: 33.769217,  // Latitude for "2002 N Main St, Santa Ana, CA 92706"
        longitude: -117.867665, // Longitude for "2002 N Main St, Santa Ana, CA 92706"
      },
      timestamp: Date.now(),
    };
    setLocation(testLocation);
      }
    }

    fetchGroups();
    getCurrentLocation();
  }, [])

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('View Detail', { group: item })}>
        <View style={{ margin: 5 }}>
          <View style={{ flexDirection: 'row', margin: 5, alignItems: 'center', justifyContent: "space-between" }}>
            <Text variant="titleMedium"> Name: {item.name} </Text>

          </View>
          <View style={{ flexDirection: 'row', margin: 5, alignItems: 'center', justifyContent: "space-between" }}>
            <Text> Destination: {item.destination} </Text>
            <Text>Meeting Time: {item.meetingTime} </Text>
          </View>
          <View style={{ flexDirection: 'row', margin: 5, alignItems: 'center', justifyContent: "space-between" }}>
            <Text>Gathering Point:{item.gatheringPointName} </Text>
          </View>
          <Divider />
        </View>
      </TouchableOpacity>

    )
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>

      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.010,
            longitudeDelta: 0.010,
          }}
        >
          <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}>
              {/* Custom Marker */}
              <View style={styles.customMarker}>
                <Text style={styles.markerText}>🏠</Text>
              </View>
            </Marker>
          {markers.map(marker => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinates}
              title={marker.title}
            >
              <Callout>
                <Text>{marker.title}</Text>
              </Callout>
            </Marker>
          ))}
        </MapView>
      ) : (
        <Text>Loading...</Text>
      )}
      {errorMsg && <Text>{errorMsg}</Text>}
      <FlatList data={groups} renderItem={renderItem} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, marginBottom: 2 }} >
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

const styles = StyleSheet.create({
  map: {
    flex: 0.8,
    width: '100%',
  },
  customMarker: {
    width: 40,   // Ensure width is set
    height: 40,  // Ensure height is set
    backgroundColor: 'gray', // Optional: for visibility
    borderRadius: 20, // Optional: to make it circular
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupMarker: {
    width: 120,   // Ensure width is set
    height: 40,  // Ensure height is set
    justifyContent: 'center',
    alignItems: 'center',
  },

  markerText: {
    color: 'red',
  },
})
