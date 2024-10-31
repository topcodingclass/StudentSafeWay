import { View, SafeAreaView, FlatList, TouchableOpacity, Alert, StyleSheet, Modal, ScrollView } from "react-native";
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
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
    const [currentTab, setCurrentTab] = useState('hazards'); // State to toggle between 'hazards' and 'helps'
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false); // State for Modal visibility

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

    const fetchWeather = async () => {
        try {
          const apiKey = ''; 
          const city = 'Irvine'; // Replace with your city
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
          );
    
          if (!response.ok) {
            throw new Error('Error fetching weather data');
          }
    
          const data = await response.json();
          
          // Log the full response to debug
          console.log("Weather API Response:", data);
    
          // Check if the necessary properties exist in the response
          if (data.main && data.weather) {
            setWeather({
              temperature: Math.round(data.main.temp),
              condition: data.weather[0].main,
            });
          } else {
            throw new Error('Incomplete weather data');
          }
        } catch (error) {
          console.error("Error fetching weather data:", error);
          setError('Unable to fetch weather data');
        }
      };
    
    
      useEffect(() => {
        fetchWeather();
        // fetchUserName();
      }, []);

    useLayoutEffect(() => {
        // Always set header, even if studentData is not ready yet
        navigation.setOptions({
            header: () =>  <SafeAreaView>
            <View style={styles.headerContainer}>
            <Text style={styles.welcomeText}>Welcome, {studentData?.name}!</Text>
            {weather ? (
              <Text style={styles.weatherText}>
                {weather.temperature}°F, {weather.condition}
              </Text>
            ) : error ? (
              <Text style={styles.weatherErrorText}>{error}</Text>
            ) : (
              <Text>Loading weather...</Text>
            )}
            <IconButton
              size={20}
              onPress={() => navigation.navigate('AskForHelpScreen')}
              icon="car-emergency"
              iconColor="red"
                    />
          </View>
          </SafeAreaView>,
        });
    }, [navigation, studentData]); 

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
            console.log(helpsFromDB)
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

                //if (hazardDate.getTime() === today.getTime()) {
                const hazard = {
                    id: doc.id,
                    description: doc.data().description,
                    status: doc.data().status,
                    reportDateTime: doc.data().reportDateTime.toDate().toDateString(),
                    type: doc.data().type,
                    imaguri: doc.data().imaguri,
                    locationDescription: doc.data().locationDescription,
                    location: {
                        latitude: doc.data().location.latitude,
                        longitude: doc.data().location.longitude,
                    }
                };
                hazardFromDB.push(hazard);
                // }
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
                    subtitle={`Created:${item.reportDateTime}  Status: ${item.status}`}
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

    const renderHelpItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => focusOnMarker(item.location)}>
                <Card.Title
                    title={`${item.description} `}
                    subtitle={`Created:${item.reportDateTime}  Status: ${item.status}`}
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
                subtitle={`Created:${item.createdDateTime}  Expires: ${item.expirationDate}`}
                right={(props) => <IconButton {...props} icon="dots-vertical" onPress={() => navigation.navigate('Ride Detail', { ride: item, groupID: item.groupID })} />}
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
            <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Total Help asked: ({helps.length})</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>School Alerts ({alerts.length}):</Text> */}
                    <Text variant="titleMedium">Alerts({alerts.length})</Text>
                    <Button
                        onPress={() => navigation.navigate('Alert Send', {student:studentData})}
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

            <View style={{ marginBottom: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="titleMedium">Helps({helps.length})/Hazards({hazards.length}) </Text>
                <Button
                    onPress={() => navigation.navigate('Hazard Report', {user:studentData})}
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
                            //latitude: currentLocation.coords.latitude,
                            //longitude: currentLocation.coords.longitude,
                            latitude: 33.761663279215725,
                            longitude: -117.86733512099948,
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
                                coordinate={{
                                    latitude: help.location.lat,
                                    longitude: help.location.lang
                                }}
                            >
                                <View>
                                    <Text style={{ fontSize: 30 }}>🆘</Text>
                                </View>
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

                    {/* Tab Buttons */}
                    <View style={styles.tabButtons}>
                        <Button
                            onPress={() => setCurrentTab('hazards')}
                            buttonColorolor={currentTab === 'hazards' ? '#6200ee' : '#000'}
                        >Hazards
                        </Button>
                        <Button
                            onPress={() => setCurrentTab('helps')}
                            buttonColorolor={currentTab === 'hazards' ? '#6200ee' : '#000'}
                        >Helps</Button>
                    </View>

                    {/* Hazards or Helps List based on currentTab */}
                    {currentTab === 'hazards' ? (
                        <FlatList
                            data={hazards}
                            renderItem={renderHazardItem}
                            keyExtractor={item => item.id}
                            style={{ flex: 1 }}
                        />
                    ) : (
                        <FlatList
                            data={helps}
                            renderItem={renderHelpItem}
                            keyExtractor={item => item.id}
                            style={{ flex: 1 }}
                        />
                    )}
                </View>
            ) : (
                <Text>Loading...</Text>
            )}

            {/* Modal for E-Bike Safety Tips */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>E-Bike Safety Tips</Text>
                        <ScrollView>
                            <Text style={styles.modalText}>1. Always wear a helmet for safety.</Text>
                            <Text style={styles.modalText}>2. Check your brakes before each ride.</Text>
                            <Text style={styles.modalText}>3. Obey traffic laws and signals.</Text>
                            <Text style={styles.modalText}>4. Be aware of your surroundings and watch for pedestrians.</Text>
                            <Text style={styles.modalText}>5. Use hand signals when turning or changing lanes.</Text>
                            <Text style={styles.modalText}>6. Keep your lights and reflectors visible, especially at night.</Text>
                            <Text style={styles.modalText}>7. Don’t ride too fast in crowded areas.</Text>
                            <Text style={styles.modalText}>8. Regularly maintain your e-bike to ensure it's in good condition.</Text>
                            <Text style={styles.modalText}>9. Be cautious on wet or slippery surfaces.</Text>
                            <Text style={styles.modalText}>10. Make sure your battery is fully charged before heading out.</Text>
                        </ScrollView>
                        <Button
                            mode="contained"
                            onPress={() => setIsModalVisible(false)}
                            style={styles.closeButton}
                        >
                            Close
                        </Button>
                    </View>
                </View>
            </Modal>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>

                <Button
                    onPress={() => navigation.navigate('Walk Group List')}
                    icon="walk"
                    mode="contained"
                    style={{ flex: 1 }}
                >
                    Join Group
                </Button>
                <Button
                    onPress={() => navigation.navigate('Suggest Add')}
                    icon="head-lightbulb"
                    mode="contained"
                    style={{ flex: 1, marginLeft: 5 }}
                >
                    Add Suggestion
                </Button>
                <Button
                    onPress={() => setIsModalVisible(true)} // Trigger the modal
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
    tabButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 5,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
      },
      welcomeText: {
        fontSize: 16,
      },
      weatherText: {
        fontSize: 16,
      },
      weatherErrorText: {
        color: 'red',
        fontSize: 16,
      },
      modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 10,
    },
    closeButton: {
        marginTop: 20,
    },
});

export default MainScreen;
