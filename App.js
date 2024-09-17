import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AlertSendScreen from './screens/AlertSendScreen';
import ImageUploadTest from './screens/ImageUploadTest';
import HazardUpdateScreen from './screens/HazardUpdateScreen';
import MapTest from './screens/MapTest';
import HazardReportScreen from './screens/HazardReportScreen';
import WalkGroupListScreen from './screens/WalkGroupListScreen';
import WalkGroupCreateScreen from './screens/WalkGroupCreateScreen';
import MainScreen from './screens/MainScreen';
import LogInScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import WalkGroupDetailScreen from './screens/WalkGroupDetailScreen';
import SuggestAddScreen from './screens/SuggestAddScreen';
import SuggestListScreen from './screens/SuggestListScreen';
import Header from './screens/Header';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
    <Stack.Navigator>
    <Stack.Screen name="Login" component={LogInScreen} options={{ headerShown: false}} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Main" component={MainScreen} options={{header:Header}} />
    <Stack.Screen name="Hazard Report" component={HazardReportScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Hazard Update" component={HazardUpdateScreen}/>
    <Stack.Screen name="Alert Send" component={AlertSendScreen} />
    <Stack.Screen name="Suggest Add" component={SuggestAddScreen} />
    <Stack.Screen name="Suggest List" component={SuggestListScreen} />
    <Stack.Screen name="Walk Group List" component={WalkGroupListScreen}/>
    <Stack.Screen name="Walk Group Detail" component={WalkGroupDetailScreen}/>
    <Stack.Screen name="Create Group" component={WalkGroupCreateScreen} />
    <Stack.Screen name="MapTest" component={MapTest} options={{ headerShown: false }} />
    <Stack.Screen name="Test" component={ImageUploadTest} options={{ headerShown: false }} />
  </Stack.Navigator>
  </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({})