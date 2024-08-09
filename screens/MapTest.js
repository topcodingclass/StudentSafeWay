import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapTest() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Define multiple markers
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

  // Request permission and get current position
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Hello World this is My First App</Text>
      <Text style={{ color: 'red', fontSize: 16, marginBottom: 20 }}>I'm here</Text>
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Current Location"
          />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  map: {
    flex: 1,
    width: '100%',
  },
});
