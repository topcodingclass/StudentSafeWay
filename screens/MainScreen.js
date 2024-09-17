import { View, SafeAreaView, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Text, Button, IconButton, Divider, Card } from "react-native-paper";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from 'expo-location';

const MainScreen = ({ navigation }) => {
    // setting up state for hazards and current location
    const [hazards, setHazards] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    
    // reference to the map so we can control it later
    const mapRef = useRef(null);

    // this runs once the component mounts
    useEffect(() => {
        // function to get the user's current location
        const getCurrentLocation = async () => {
            // ask for location permission
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                // if permission is denied, show an alert
                Alert.alert("Permission Denied", "Permission to access location was denied.");
                return; // exit if no permission
            }

            try {
                // get the current location
                let location = await Location.getCurrentPositionAsync({});
                console.log("Location:", location); // just logging for debugging

                // we're using a test location for now, just for testing
                const testLocation = {
                    coords: {
                        latitude: 33.769217,
                        longitude: -117.867665,
                    },
                    timestamp: Date.now(),
                };

                console.log(testLocation); // log the test location too
                setCurrentLocation(testLocation); // save the location in state
            } catch (error) {
                // if there's an error, log it
                console.error("Error getting location:", error);
            }
        };

        // get today's date, and set the time to midnight to simplify comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0); // set time to 00:00:00

        // listen for real-time updates from firebase
        const unsubscribe = onSnapshot(collection(db, "hazards"), (querySnapshot) => {
            const hazardFromDB = [];
            querySnapshot.forEach((doc) => {
                const hazardDate = doc.data().createdDateTime.toDate();
                hazardDate.setHours(0, 0, 0, 0); // set hazard time to midnight too

                // only add hazards that were created today
                if (hazardDate.getTime() === today.getTime()) {
                    const hazard = {
                        id: doc.id, // get the document id
                        message: doc.data().hazardMessage, // get the hazard message
                        status: doc.data().status, // get the hazard status
                        created: doc.data().createdDateTime.toDate().toDateString(), // format the date
                        type: doc.data().hazardType, // get the hazard type
                        location: {
                            latitude: doc.data().location.latitude, // get latitude
                            longitude: doc.data().location.longitude, // get longitude
                        }
                    };
                    hazardFromDB.push(hazard); // add to our array
                }
            });
            setHazards(hazardFromDB); // update our state with today's hazards
        });

        getCurrentLocation(); // go ahead and get the user's location

        // clean up the firebase listener when the component unmounts
        return () => unsubscribe();
    }, []);

    // function to animate the map to focus on a specific marker
    const focusOnMarker = (location) => {
        // animate the map to the selected location
        mapRef.current.animateToRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,  // how zoomed in/out we want to be
            longitudeDelta: 0.01, // same for longitude
        }, 1000); // animation duration
    };

    // this function renders each hazard in the list
    const renderItem = ({ item }) => {
        return (
            // when you click the card, it moves the map to the hazard's location
            <TouchableOpacity onPress={() => focusOnMarker(item.location)}>
                <Card style={{ marginVertical: 5 }}>
                    <Card.Content>
                        <Text variant="titleSmall">Created: {item.created}</Text>
                        <Text variant="bodyMedium">Hazard: {item.message}</Text>
                        <Text variant="bodySmall">Status: {item.status}</Text>
                    </Card.Content>
                    <Card.Actions>
                        {/* this icon button opens up more options, like editing the hazard */}
                        <IconButton
                            icon="dots-vertical"
                            onPress={() => navigation.navigate('Hazard Update', { hazard: item })}
                        />
                    </Card.Actions>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={{ margin: 10 }}>
            {/* header section with some text and an icon */}

            <View style={{ height: 200 }}>
                <Text>School Alerts: </Text>
            </View>

            {/* main section where we show the map and the list of hazards */}
            {currentLocation ? (
                <View>
                    {/* this is the map view */}
                    <MapView
                        ref={mapRef} // this connects the map to our ref
                        style={{ width: "100%", height: "60%" }}
                        initialRegion={{
                            latitude: currentLocation.coords.latitude,
                            longitude: currentLocation.coords.longitude,
                            latitudeDelta: 0.010,
                            longitudeDelta: 0.010,
                        }}
                    >
                        {/* marker for the user's current location */}
                        <Marker
                            coordinate={{
                                latitude: currentLocation.coords.latitude,
                                longitude: currentLocation.coords.longitude,
                            }}>
                        </Marker>
                        {/* markers for each hazard in the list */}
                        {hazards.map((hazard) => (
                            <Marker
                                key={hazard.id} // each marker needs a unique key
                                coordinate={hazard.location} // where the marker is on the map
                            >
                                <Callout>
                                    {/* when you tap the callout, it takes you to the hazard update screen */}
                                    <TouchableOpacity onPress={() => navigation.navigate('Hazard Update', { hazard })}>
                                        <View>
                                            <Text style={{ fontWeight: 'bold' }}>{hazard.message}</Text>
                                            <Text>Status: {hazard.status}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Callout>
                            </Marker>
                        ))}
                    </MapView>

                    {/* this is the list of hazards */}
                    <FlatList
                        data={hazards} // our array of today's hazards
                        renderItem={renderItem} // how each item in the list should look
                        keyExtractor={item => item.id} // unique key for each list item
                        style={{ flex: 1 }}
                    />
                </View>
            ) : (
                // if the location isn't loaded yet, just show a loading text
                <Text>Loading...</Text>
            )}
            {/* buttons for reporting a new hazard and joining a walk group */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 1 }}>
                <Button
                    onPress={() => navigation.navigate('Hazard Report')}
                    icon="alert"
                    mode="contained"
                    style={{ flex: 1 }}
                >
                    Report Hazard
                </Button>
                <Button
                    icon="walk"
                    mode="contained"
                    style={{ flex: 1 }}
                >
                    Join Walk Group
                </Button>
            </View>
        </SafeAreaView>
    );
};

// some basic styles for the map and custom markers
const styles = StyleSheet.create({
    map: {
        flex: 0.8,
        width: '100%',
    },
    customMarker: {
        width: 40,
        height: 40,
        backgroundColor: 'gray',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerText: {
        color: 'red',
    },
})

export default MainScreen;
