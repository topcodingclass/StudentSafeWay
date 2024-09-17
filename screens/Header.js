// Header.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { IconButton } from 'react-native-paper';

const Header = () => {
    return (
    <SafeAreaView>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
    <Text variant="labelLarge">Hello Scooby Doo!</Text>
    <Text variant="labelLarge">15 degrees, Sunny</Text>
    <IconButton
        icon="account"
        size={20}
        onPress={() => console.log('Pressed')}
    />
    </View>
    </SafeAreaView>
    );
};

export default Header;
