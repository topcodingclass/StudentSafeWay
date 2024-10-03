import { View, SafeAreaView, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Text, Button, IconButton, Divider, Card } from "react-native-paper";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from 'expo-location';

const MainScreen = ({ navigation }) => {
    const [hazards, setHazards] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [helps, setHelps] = useState([]); // State for helps (SOS markers)
    const [currentLocation, setCurrentLocation] = useState(null);
    const [studentData, setStudentData] = useState(null); // Store student data here
    const mapRef = useRef(null);

    const studentID = auth.currentUser.uid;

    // Fetch student data from Firebase
    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const studentDoc = await getDoc(doc(db, "students", studentID));

                if (studentDoc.exists()) {
                    setStudentData(studentDoc.data()); // Set the student data in state
                } else {
                    console.error("No such student data found!");
                }
            } catch (error) {
                console.error("Error fetching student data:", error);
            }
        };

        fetchStudentData();
    }, []);

    // Fetch helps (SOS alerts) from Firebase
    useEffect(() => {
        const unsubscribeHelps = onSnapshot(collection(db, "helps"), (querySnapshot) => {
            const helpsFromDB = [];
            querySnapshot.forEach((doc) => {
                const help = {
                    id: doc.id,
                    ...doc.data(),
                };
                helpsFromDB.push(help);
            });
            setHelps(helpsFromDB);
        });

        return () => {
            unsubscribeHelps();
        };
    }, []);

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
                setCurrentLocation(location);
            } catch (error) {
                console.error("Error getting location:", error);
            }
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch hazards from Firestore
        const unsubscribeHazards = onSnapshot(collection(db, "hazards"), (querySnapshot) => {
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

        // Fetch alerts from Firestore
        const unsubscribeAlerts = onSnapshot(collection(db, "alerts"), (querySnapshot) => {
            const alertsFromDB = [];
            querySnapshot.forEach((doc) => {
                const alertData = {
                    id: doc.id,
                    schoolID: doc.data().schoolID,
                    message: doc.data().message,
                    createdDateTime: doc.data().createdDateTime.toDate().toDateString(),
                    expirationDate: doc.data().expirationDate,
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
                <Card.Title
             title={`${item.description} `}
             subtitle ={`Created:${item.reportDateTime}  Status: ${item.status}`}
            right={(props) => <IconButton {...props} icon="dots-vertical" onPress={() => navigation.navigate('Hazard Update', { hazard: item })} />}
        />
                {/* <Card style={{ marginVertical: 5 }}>
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
                </Card> */}
            </TouchableOpacity>
        );
    };

    const renderAlertItem = ({ item }) => {
        return (
            <Card.Title
             title={`${item.message} `}
             subtitle ={`Created:${item.createdDateTime}  Expires: ${item.expirationDate}`}
            right={(props) => <IconButton {...props} icon="dots-vertical" onPress={() => navigation.navigate('Ride Detail', {ride:item, groupID: item.groupID})} />}
        />
            // <Card>
            //     <Card.Content>
            //         <Text variant="titleSmall">Alert: {item.message}</Text>
            //         <Text variant="bodyMedium">Created: {item.createdDateTime}</Text>
            //         <Text variant="bodySmall">Expires: {item.expirationDate}</Text>
            //     </Card.Content>
            // </Card>
        );
    };

    return (
        <SafeAreaView style={{ margin: 10 }}>
            {/* Display the number of alerts */}
            <View style={{ height: 200 }}>
                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
            {/* <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Total Help asked: ({helps.length})</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>School Alerts ({alerts.length}):</Text> */}
             <Text variant="titleMedium">Alerts({alerts.length})</Text>
             <Button
                    onPress={() => navigation.navigate('Hazard Report')}
                    icon="alert"
                    mode="text"
                >
                    Send Alert
                </Button>
                </View>
             <Divider />
                <FlatList
                    data={alerts}
                    renderItem={renderAlertItem}
                    keyExtractor={(item) => item.id}
                />
            </View>

            <View style={{marginBottom:5, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
            <Text variant="titleMedium">Helps({helps.length})/Hazards({hazards.length}) </Text>
            <Button
                    onPress={() => navigation.navigate('Hazard Report')}
                    mode="text"
                >
                    Report Hazard
                </Button>
            </View>

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
                        />

                        {/* Existing hazards */}
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

                        {/* Display help requests (SOS markers) only as map markers */}
                        {helps.map((help) => (
                            <Marker
                                key={help.id}
                                coordinate={help.location}
                                pinColor="red"
                            >
                                <Callout>
                                    <View>
                                        <Text style={{ fontWeight: 'bold' }}>{help.description}</Text>
                                        <Text>Status: {help.status}</Text>
                                        <Text>Called by: {help.studentID}</Text>
                                    </View>
                                </Callout>
                            </Marker>
                        ))}
                    </MapView>

                    {/* Display the number of hazards */}
                    <Text style={{ fontWeight: 'bold', fontSize: 18, marginVertical: 5 }}>
                        Hazards ({hazards.length}):
                    </Text>

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
                    icon="walk"
                    mode="contained"
                    style={{ flex: 1 }}
                >
                    Join Group
                </Button>
                <Button
                    onPress={() => navigation.navigate('AskForHelpScreen')}
                    icon="help-circle"
                    mode="contained"
                    style={{ flex: 1, marginLeft: 5 }}
                >
                    Ask For Help
                </Button>
                <Button
                    onPress={() => navigation.navigate('AskForHelpScreen')}
                    icon="bike"
                    mode="contained"
                    style={{ flex: 1, marginLeft: 5 }}
                >
                    E-Bike safety
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
