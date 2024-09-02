import React, { useEffect, useState } from 'react';
import { StyleSheet, View, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Text, Divider, Button } from 'react-native-paper';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from '../firebase';

const WalkGroupDetailScreen = ({ route, navigation }) => {
    const { group } = route.params;
    const [students, setStudents] = useState([]);
    const [gradeCounts, setGradeCounts] = useState([]);
    const user = { studentID: "ccc", grade: "11" };

    useEffect(() => {
        navigation.setOptions({
            title: group.name,
        });
    }, [navigation]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const studentsCollection = await getDocs(collection(db, `groups/${group.id}/students`));
                const studentsList = studentsCollection.docs.map(studentDoc => ({ id: studentDoc.id, ...studentDoc.data() }));
                setStudents(studentsList);
                const counts = {};
                studentsList.forEach(item => {
                    const grade = item.grade.replace(/\"/g, ''); // Removing quotes if present
                    if (!counts[grade]) {
                        counts[grade] = 0;
                    }
                    counts[grade] += 1;
                });
                const countsArray = Object.keys(counts).map(key => ({
                    grade: key,
                    count: counts[key],
                }));
                setGradeCounts(countsArray);

            } catch (error) {
                console.error('Error fetching students: ', error);
            }
        };

        fetchStudents();
    }, []);

    const addStudent = async () => {
        try {
            await addDoc(collection(db, "groups", group.id, "students"), user);
            console.log('Student added to group successfully');
        } catch (error) {
            console.error('Error adding student to group: ', error);
        }
    };

    const deleteStudent = async () => {
        try {
            const q = query(collection(db, "groups", group.id, "students"), where("studentID", "==", user.studentID));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((document) => {
                deleteDoc(doc(db, "groups", group.id, "students", document.id));
            });
            console.log('Student deleted from group successfully');
        } catch (error) {
            console.error('Error deleting student from group: ', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.groupInfo}>
                <Text variant="titleMedium" style={styles.infoText}>Destination: {group.destination}</Text>
                <Text variant="titleMedium" style={styles.infoText}>Gathering Point: {group.gatheringPoint}</Text>
                <Text variant="titleMedium" style={styles.infoText}>Meeting Time: {group.meetingTime}</Text>
            </View>
            <Divider />
            <View>
                <Text variant="titleLarge" style={styles.headerText}>Group Members</Text>
            </View>
            <FlatList
                data={gradeCounts}
                keyExtractor={(item) => item.grade}
                renderItem={({ item }) => (
                    <View style={styles.gradeRow}>
                        <Text variant="titleMedium" style={styles.gradeText}>{item.grade}th:</Text>
                        <Text variant="titleMedium" style={styles.gradeText}>{item.count} students</Text>
                    </View>
                )}
            />
            <View style={styles.buttonContainer}>
                <Button icon="account-multiple-plus" mode="contained" onPress={addStudent} style={styles.button}>
                    Join Group
                </Button>
                <Button icon="logout" mode="contained" onPress={deleteStudent} style={styles.button}>
                    Leave Group
                </Button>
            </View>
        </SafeAreaView>
    );
}

export default WalkGroupDetailScreen;

const styles = StyleSheet.create({
    container: {
        margin:10,
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    groupInfo: {
        marginBottom: 16,
    },
    infoText: {
        marginVertical: 4,
    },
    headerText: {
        marginVertical: 16,
        fontWeight: 'bold',
    },
    gradeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between', marginHorizontal:10,
        marginVertical: 4,
    },
    gradeText: {
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 24,
    },
    button: {
        flex: 1,
        marginHorizontal: 8,
    },
});
