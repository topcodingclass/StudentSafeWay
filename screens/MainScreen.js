import { View, SafeAreaView, FlatList, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { Text, Button } from "react-native-paper";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import MapView, { Marker } from "react-native-maps";
import * as Location from 'expo-location';

const MainScreen = ({ navigation }) => {
    // State to store the list of hazards fetched from Firebase
    const [hazards, setHazards] = useState([]);
    // State to store the user's current location
    const [currentLocation, setCurrentLocation] = useState(null);

    // useEffect hook to request location permission and fetch hazards from Firebase
    useEffect(() => {
        // IIFE (Immediately Invoked Function Expression) to request location permission and get the current location
        (async () => {
            // Request permission to access the user's location
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                // Show an alert if permission is denied
                Alert.alert("Permission Denied", "Permission to access location was denied.");
                return; // Exit the function if permission is denied
            }

            try {
                // Get the user's current location
                let location = await Location.getCurrentPositionAsync({});
                console.log("Location:", location); // Debugging: log the location object

                // Set the user's current location in state with some default zoom level
                setCurrentLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.01, // Zoom level (latitude)
                    longitudeDelta: 0.01, // Zoom level (longitude)
                });
            } catch (error) {
                // Handle any errors that occur while getting the location
                console.error("Error getting location:", error);
            }
        })();

        // Firebase real-time listener to fetch hazards and update the state when the data changes
        const unsubscribe = onSnapshot(collection(db, "hazards"), (querySnapshot) => {
            const hazardFromDB = [];
            // Loop through each document in the collection and extract data
            querySnapshot.forEach((doc) => {
                const hazard = {
                    id: doc.id, // Document ID
                    message: doc.data().hazardMessage, // Hazard message
                    status: doc.data().status, // Hazard status
                    created: doc.data().createdDateTime.toDate().toDateString(), // Creation date (formatted)
                    type: doc.data().hazardType, // Hazard type
                    location: {
                        latitude: doc.data().location.latitude, // Latitude from Firebase
                        longitude: doc.data().location.longitude, // Longitude from Firebase
                    }
                };
                hazardFromDB.push(hazard); // Add hazard to the array
            });
            // Update the state with the new list of hazards
            setHazards(hazardFromDB);
        });

        // Cleanup function to unsubscribe from the Firebase listener when the component unmounts
        return () => unsubscribe();
    }, []);

    // Function to render each item in the FlatList (a hazard)
    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => { navigation.navigate('Hazard Update', { hazard: item }) }}>
                <View style={{ marginTop: 7 }}>
                    <Text>Created: {item.created}</Text>
                    <Text>Hazard: {item.message}</Text>
                    <Text>Status: {item.status}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={{ margin: 10 }}>
            {/* Header section */}
            <View style={{ height: 200 }}>
                <Text>School Alerts: </Text>
            </View>

            {/* Map and hazards list section */}
            <View>
                <MapView
                    style={{ width: "100%", height: "60%" }}
                    region={currentLocation || {
                        latitude: 37.78825, // Default latitude (fallback if currentLocation is null)
                        longitude: -122.4324, // Default longitude (fallback if currentLocation is null)
                        latitudeDelta: 0.01, // Default zoom level
                        longitudeDelta: 0.01, // Default zoom level
                    }} // Center map on current location or fallback region
                    showsUserLocation={true} // Optional: Shows blue dot for user's location
                >
                    {/* Marker for the user's current location, if available */}
                    {currentLocation && (
                        <Marker
                            coordinate={currentLocation} // Set marker at the user's current location
                            title="You are here" // Title for the marker
                            pinColor="blue" // Color of the marker pin
                        />
                    )}
                    {/* Markers for each hazard fetched from Firebase */}
                    {hazards.map((hazard) => (
                        <Marker
                            key={hazard.id} // Unique key for each marker (using document ID)
                            coordinate={hazard.location} // Set marker at the hazard's location
                            title={hazard.message} // Title for the marker (hazard message)
                            description={`Status: ${hazard.status}`} // Description for the marker (hazard status)
                        />
                    ))}
                </MapView>

                {/* List of hazards displayed below the map */}
                <FlatList
                    data={hazards} // Data source for the list (hazards array)
                    renderItem={renderItem} // Function to render each item in the list
                    keyExtractor={item => item.id} // Key extractor for each list item (using document ID)
                    style={{ flex: 1 }}
                />
            </View>

            {/* Buttons for reporting a hazard and joining a walk group */}
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

export default MainScreen;
