import { StatusBar } from "expo-status-bar"; 
import { 
	Button, 
	StyleSheet, 
	Text, 
	View, 
	Share, 
	Alert, 
	Linking, 
} from "react-native"; 
import * as Location from "expo-location"; 
import { useEffect, useState } from "react"; 

export default function LocationTest() { 

	// State variable to store the user's location 
	const [location, setLocation] = useState(null); 

	// Function to fetch the user's location 
	const fetchLocation = async () => { 
		await Location.requestForegroundPermissionsAsync(); 

		const { 
			coords: { latitude, longitude }, 
		} = await Location.getCurrentPositionAsync({}); 
		setLocation({ latitude, longitude }); 
        console.log("Requesting location with high accuracy");

		// Show an alert when the location is updated 
		Alert.alert("GeeksforGeeks", "Location Updated", [ 
			{ 
				text: "Close", 
				onPress: () => console.log("Close Pressed"), 
				style: "destructive", 
			}, 
		]); 
	}; 

	// Function to share the user's location 
	const shareLocation = async () => { 
		try { 
			const result = await Share.share({ 
				// Create a Google Maps link using the user's location 
				message: 
`https://www.google.com/maps/search/?api=1&query=${location?.latitude},${location?.longitude}`, 
			}); 

			if (result.action === Share.sharedAction) { 
				if (result.activityType) { 
					console.log("shared with activity type of ", 
						result.activityType); 
				} else { 
					console.log("shared"); 
				} 
			} else if (result.action === Share.dismissedAction) { 
				console.log("dismissed"); 
			} 
		} catch (error) { 
		
			// Show an alert if there's an error while sharing location 
			Alert.alert( 
				"GeeksforGeeks", 
				"Something went wrong while sharing location", 
				[ 
					{ 
						text: "Close", 
						onPress: () => console.log("Close Pressed"), 
						style: "destructive", 
					}, 
				] 
			); 
		} 
	}; 

	// Fetch the user's location when the component mounts 
	useEffect(() => { 
		fetchLocation(); 
	}, []); 

	return ( 
		<View style={styles.container}> 
			<Text style={styles.heading}> 
				Welcome to GeeksforGeeks 
			</Text> 
			<Text style={styles.heading2}> 
				Location Sharing App 
			</Text> 
			{location ? ( 
				<View> 
					<Text style={styles.text1}> 
						Latitude: {location?.latitude} 
					</Text> 
					<Text style={styles.text1}> 
						Longitude: {location?.longitude} 
					</Text> 
					<Button 
						onPress={() => { 
						
							// Open Google Maps with the user's location 
							Linking.openURL( 
`https://www.google.com/maps/search/?api=1&query=${location?.latitude},${location?.longitude}` 
							); 
						}} 
						title="Open in Google Maps"
					/> 
				</View> 
			) : ( 
				<Text style={styles.text1}> 
					Loading... 
				</Text> 
			)} 
			<Button title="Update Location"
				onPress={fetchLocation} /> 
			<Button title="Share Location"
				onPress={shareLocation} /> 

			<StatusBar style="auto" /> 
		</View> 
	); 
} 

const styles = StyleSheet.create({ 
	container: { 
		display: "flex", 
		alignContent: "center", 
		alignItems: "center", 
		justifyContent: "space-evenly", 
		backgroundColor: "#fff", 
		height: "100%", 
	}, 
	heading: { 
		fontSize: 28, 
		fontWeight: "bold", 
		marginBottom: 10, 
		color: "green", 
		textAlign: "center", 
	}, 
	heading2: { 
		fontSize: 22, 
		fontWeight: "bold", 
		marginBottom: 10, 
		color: "black", 
		textAlign: "center", 
	}, 
	text1: { 
		fontSize: 16, 
		marginBottom: 10, 
		color: "black", 
		fontWeight: "bold", 
	}, 
});
