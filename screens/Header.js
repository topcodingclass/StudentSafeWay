import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { IconButton } from 'react-native-paper';
import { auth } from '../firebase'; // Firebase auth to get the user's name

const Header = () => {
  const [weather, setWeather] = useState(null);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState(null);

  // Fetch weather data
  const fetchWeather = async () => {
    try {
      const apiKey = 'f376f73aad8ba601cb243638b117ade7'; // Replace with your actual API key
      const city = 'London'; // Replace with your city
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
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

  // Get current user's name
//   const fetchUserName = () => {
//     const user = auth.currentUser;
//     if (user) {
//       setUserName(user.displayName || "User");
//     } else {
//       setUserName('Guest'); // Default if no user is logged in
//     }
//   };

  useEffect(() => {
    fetchWeather();
    // fetchUserName();
  }, []);

  return (
    <SafeAreaView>
      <View style={styles.headerContainer}>
        <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
        {weather ? (
          <Text style={styles.weatherText}>
            {weather.temperature}°C, {weather.condition}
          </Text>
        ) : error ? (
          <Text style={styles.weatherErrorText}>{error}</Text>
        ) : (
          <Text>Loading weather...</Text>
        )}
        <IconButton
          icon="account"
          size={20}
          onPress={() => console.log('Account icon pressed')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 10,
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
});

export default Header;
