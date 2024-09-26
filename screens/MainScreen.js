import { View, SafeAreaView, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Text, Button, IconButton, Divider, Card } from "react-native-paper";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from 'expo-location';

const MainScreen = ({ navigation }) => {
    const [hazards, setHazards] = useState([]);
    const [alerts, setAlerts] = useState([]); // State for alerts
    const [currentLocation, setCurrentLocation] = useState(null);
    const mapRef = useRef(null);

    // Fetch current location and hazards from Firestore
    useEffect(() => {
        const getCurrentLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "Permission to access location was denied.");
                return;
            }

            try {
                let location = await Location.getCurrentPositionAsync({});
                const testLocation = {
                    coords: {
                        latitude: 33.769217,
                        longitude: -117.867665,
                    },
                    timestamp: Date.now(),
                };

                setCurrentLocation(testLocation);
            } catch (error) {
                console.error("Error getting location:", error);
            }
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const unsubscribeHazards = onSnapshot(collection(db, "hazard1"), (querySnapshot) => {
            const hazardFromDB = [];
            querySnapshot.forEach((doc) => {
                const hazardDate = doc.data().reportDateTime.toDate();
                hazardDate.setHours(0, 0, 0, 0);

                if (hazardDate.getTime() === today.getTime()) {
                    const hazard = {
                        id: doc.id,
                        description: doc.data().description,
                        status: doc.data().status,
                        reportDateTime: doc.data().reportDateTime.toDate().toDateString(),
                        type: doc.data().type,
                        location: {
                            latitude: doc.data().location.latitude,
                            longitude: doc.data().location.longitude,
                        }
                    };
                    hazardFromDB.push(hazard);
                }
            });
            setHazards(hazardFromDB);
        });

        const unsubscribeAlerts = onSnapshot(collection(db, "alerts"), (querySnapshot) => {
            const alertsFromDB = [];
            querySnapshot.forEach((doc) => {
                const alertData = {
                    id: doc.id,
                    schoolID: doc.data().schoolID,
                    message: doc.data().message,
                    createdDateTime: doc.data().createdDateTime.toDate().toDateString(),
                    expirationDate: doc.data().expirationDate.toDate().toDateString(),
                    createdBy: doc.data().createdBy,
                };
                alertsFromDB.push(alertData);
            });
            setAlerts(alertsFromDB);
        });

        getCurrentLocation();

        return () => {
            unsubscribeHazards();
            unsubscribeAlerts();
        };
    }, []);

    const focusOnMarker = (location) => {
        mapRef.current.animateToRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }, 1000);
    };

    const renderHazardItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => focusOnMarker(item.location)}>
                <Card style={{ marginVertical: 5 }}>
                    <Card.Content>
                        <Text variant="titleSmall">Created: {item.reportDateTime}</Text>
                        <Text variant="bodyMedium">Hazard: {item.description}</Text>
                        <Text variant="bodySmall">Status: {item.status}</Text>
                    </Card.Content>
                    <Card.Actions>
                        <IconButton
                            icon="dots-vertical"
                            onPress={() => navigation.navigate('Hazard Update', { hazard: item })}
                        />
                    </Card.Actions>
                </Card>
            </TouchableOpacity>
        );
    };

    const renderAlertItem = ({ item }) => {
        return (
            <Card style={{ marginVertical: 5 }}>
                <Card.Content>
                    <Text variant="titleSmall">Alert: {item.message}</Text>
                    <Text variant="bodyMedium">Created: {item.createdDateTime}</Text>
                    <Text variant="bodySmall">Expires: {item.expirationDate}</Text>
                </Card.Content>
            </Card>
        );
    };

    return (
        <SafeAreaView style={{ margin: 10 }}>
            {/* FlatList for Alerts */}
            <View style={{ height: 200 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>School Alerts:</Text>
                <FlatList
                    data={alerts}
                    renderItem={renderAlertItem}
                    keyExtractor={(item) => item.id}
                />
            </View>

            <Divider />

            {currentLocation ? (
                <View>
                    <MapView
                        ref={mapRef}
                        style={{ width: "100%", height: "60%" }}
                        initialRegion={{
                            latitude: currentLocation.coords.latitude,
                            longitude: currentLocation.coords.longitude,
                            latitudeDelta: 0.010,
                            longitudeDelta: 0.010,
                        }}
                    >
                        <Marker
                            coordinate={{
                                latitude: currentLocation.coords.latitude,
                                longitude: currentLocation.coords.longitude,
                            }}
                        >
                        </Marker>
                        {hazards.map((hazard) => (
                            <Marker
                                key={hazard.id}
                                coordinate={hazard.location}
                            >
                                <Callout>
                                    <TouchableOpacity onPress={() => navigation.navigate('Hazard Update', { hazard })}>
                                        <View>
                                            <Text style={{ fontWeight: 'bold' }}>{hazard.description}</Text>
                                            <Text>Status: {hazard.status}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Callout>
                            </Marker>
                        ))}
                    </MapView>

                    {/* FlatList for Hazards */}
                    <FlatList
                        data={hazards}
                        renderItem={renderHazardItem}
                        keyExtractor={item => item.id}
                        style={{ flex: 1 }}
                    />
                </View>
            ) : (
                <Text>Loading...</Text>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                <Button
                    onPress={() => navigation.navigate('Hazard Report')}
                    icon="alert"
                    mode="contained"
                    style={{ flex: 1, marginRight: 5 }}
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
});

export default MainScreen;
