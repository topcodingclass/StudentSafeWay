import { View, SafeAreaView, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Text, Button, IconButton, Divider, Card } from "react-native-paper";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from 'expo-location';

const EbikeSafetyScreen = ({ navigation }) => {
  const [hazards, setHazards] = useState([]);
  const [helps, setHelps] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [studentData, setStudentData] = useState(null); // Store student data here
  const [currentLocation, setCurrentLocation] = useState(null);
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
    <SafeAreaView style={styles.container}>
      {/* Safety Instructions */}
      <View style={styles.safetyContainer}>
        <Text style={styles.header}>Electronic Bike Safety:</Text>
        <Text style={styles.safetyText}>1. Stay in the bike lane</Text>
        <Text style={styles.safetyText}>2. Don't speed</Text>
      </View>

      {/* Map showing hazards */}
      {currentLocation ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {hazards.map((hazard) => (
            <Marker
              key={hazard.id}
              coordinate={hazard.location}
            >
              <Callout>
                <View>
                  <Text style={{ fontWeight: 'bold' }}>{hazard.type}</Text>
                  <Text>{hazard.description}</Text>
                  <Text>Reported by: {hazard.reportPerson}</Text>
                  <Text>Time: {hazard.reportTime}</Text>
                </View>
              </Callout>
            </Marker>
          ))}

          {/* Display helps as map markers */}
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
      ) : (
        <Text>Loading map...</Text>
      )}
        <Text style={{ fontWeight: 'bold', fontSize: 18, marginVertical: 5 }}>
                        Hazards ({hazards.length}):
                    </Text>
      {/* Hazard Details */}
      <FlatList
                        data={hazards}
                        renderItem={renderHazardItem}
                        keyExtractor={item => item.id}
                        style={{ flex: 1 }}
    />

      {/* Report Hazard Button */}
      <Button
        mode="contained"
        onPress={() => navigation.navigate("Hazard Report")} // Assuming you have a "Hazard Report" screen
        style={styles.reportButton}
      >
        Report Hazard
      </Button>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  safetyContainer: {
    marginBottom: 10,
    alignItems: "center",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  safetyText: {
    fontSize: 16,
  },
  map: {
    width: "100%",
    height: "40%",
    marginBottom: 10,
  },
  hazardDetails: {
    padding: 10,
    marginBottom: 10,
  },
  hazardHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  reportButton: {
    marginTop: 10,
    alignSelf: "center",
    width: "90%",
  },
});

export default EbikeSafetyScreen;
