import React, { useState, useEffect, useLayoutEffect } from 'react';
import { SafeAreaView, View, Image, StyleSheet } from 'react-native';
import { doc, updateDoc } from "firebase/firestore";
import { TextInput, Text, Button, Divider, Provider } from 'react-native-paper';
import DropDown from 'react-native-paper-dropdown';
import { db } from '../firebase';

const HazardUpdateScreen = ({ navigation, route }) => {
    const { hazard } = route.params;
    const [status, setStatus] = useState(hazard.status);
    const [description, setDescription] = useState(hazard.description);
    const [showDropDownStatus, setShowDropDownStatus] = useState(false);

    const hazardStatus = [
        { label: "Unconfirmed", value: "Unconfirmed" },
        { label: "Potential", value: "Potential" },
        { label: "Active", value: "Active" },
        { label: "In-Progress", value: "Progress" },
        { label: "Resolved", value: "Resolved" }
    ];

    // Use useLayoutEffect to update the header title with hazard description
    useLayoutEffect(() => {
        navigation.setOptions({
            title: description || "Hazard Details", // Fallback to "Hazard Details" if no description
        });
    }, [navigation, description]);

    const updateStatusInFirebase = async () => {
        const hazardRef = doc(db, "hazards", hazard.id);
        await updateDoc(hazardRef, {
            status: status,
            hazardMessage: description
        });
        alert("Hazard Updated");
        navigation.navigate('Hazard Display'); // Navigate back
    };

    return (
        <Provider>
            <SafeAreaView style={{ margin: 8 }}>
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                        <Text variant="titleMedium">{hazard.locationDescription} : {hazard.type}</Text>
                    </View>
                    <View style={{ marginVertical: 15 }}>
                        <Text variant="titleSmall">Report Date: {hazard.reportDateTime}</Text>
                    </View>

                    <DropDown
                        label={"Hazard Status"}
                        mode={"outlined"}
                        visible={showDropDownStatus}
                        showDropDown={() => setShowDropDownStatus(true)}
                        onDismiss={() => setShowDropDownStatus(false)}
                        value={status}
                        setValue={setStatus}
                        list={hazardStatus}
                        style={{ marginTop: 40, marginBottom: 50 }}
                    />
                    <TextInput
                        label="Update Description"
                        value={description}
                        onChangeText={setDescription}
                        mode='outlined'
                        multiline
                        style={{ marginTop: 10 }}
                    />

                    <Button
                        mode="contained"
                        onPress={updateStatusInFirebase}
                        style={{ marginTop: 20 }}
                    >
                        Update Status
                    </Button>

                    <View style={{ margin: 10, justifyContent: 'center', alignItems: 'center' }}>
                        <Image
                            source={{ uri: hazard.imaguri }}
                            style={styles.image}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 300,
        height: 300,
        resizeMode: 'cover',
    },
});

export default HazardUpdateScreen;
