import { View, SafeAreaView, FlatList, TouchableOpacity} from "react-native"
import React, { useState, useEffect } from 'react'
import { TextInput, Text, Button, IconButton, Icon, Divider } from 'react-native-paper';
import { collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
import { db } from "../firebase";


const TodoScreen = ({navigation}) => {
    const [todo, setTodo] = useState('')
    const [due, setDue] = useState('')
    const [todos, setTodos] = useState([])
  
// THIS useEffect IS USED TO CONSTANTLY UPDATE todos LIST SO THAT WHENEVR YOU ADD SOMETHING, ITLL GET IT FROM FIREBASE
    useEffect(async () => {
      const todoFromDB = []
      const querySnapshot = await getDocs(collection(db, "todos"));
      // Firebase stuff here
      querySnapshot.forEach((doc) => {
        const todo = {
          id: doc.id, todo: doc.data().todo, dueDate: doc.data().dueDate,
          isFinished: doc.data().isFinished, created: doc.data().created?.toDate().toDateString()
        }
        todoFromDB.push(todo)
        //console.log(`${doc.id} => ${doc.data().dueDate}`);
      });
      setTodos([...todoFromDB])
    }, [])
  
    
        const addTodo = async () => {
      try {
        const docRef = await addDoc(collection(db, "todos"), {
          todo: todo, dueDate: due, isFinished: false, created: Timestamp.fromDate(new Date())
        });
        console.log("Document written with ID: ", docRef.id);
        newTodo = { todo: todo, dueDate: due, isFinished: false, created: Date() }
        //updates the Todos list
        setTodos([...todos, newTodo])
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
  
    //Update isFinished when todo is pressed
    const toggleTodo = (index) => {
      //1. copy todos
      let copyTodos = [...todos]
      //2. toggle isFinished
      copyTodos[index].isFinished = !copyTodos[index].isFinished
      //3. Update todos state
      setTodos([...copyTodos])
  
    }
    const deleteTodo = (index) => {
      //1. copy todos
      const copyTodos = [...todos]
      //2. delete the item
      copyTodos.splice(index, 1)
      //3. Update todos state
      setTodos([...copyTodos])
    }
  
    useEffect(() => {
      console.log(todos)
    }, [todos])
  
    // THIS IS FOR RENDERING EACH ITEM IN THE LIST
    const renderItem = ({ item, index }) => {
      return (
        <View style={{marginTop:3}}>
          <Divider />
          <Text style={{alignSelf:'center', marginTop:7}}>Created: {item.created}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.navigate("Todo Detail", {item: item})}>
              <Text style={{ textDecorationLine: item.isFinished ? 'line-through' : 'none' }}>{item.todo}   Due:{item.dueDate}</Text>
            </TouchableOpacity>
            <IconButton icon="trash-can" onPress={() => deleteTodo(index)} />
          </View>
        </View>
      )
    }
   
    
    return (
      <SafeAreaView style={{ margin: 10 }}>
        {/* Inputs */}
        <View style={{ marginTop: 20 }}>
          <TextInput label="Todo" value={todo} onChangeText={setTodo} mode="outlined" />
          <TextInput label="Due Date" value={due} onChangeText={setDue} mode="outlined" />
          <Button style={{ margin: 10 }} icon="plus" mode="contained" onPress={addTodo}>
            Add
          </Button>
        </View>
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text variant="titleMedium">Todo List</Text>
        </View>
        {/* THIS IS THE LIST ITSELF. IT GETS DATA FROM todos AND RENDERS IT FROM THE INSTRUCTIONS IN renderItem */}
        <FlatList data={todos} renderItem={renderItem} />
      </SafeAreaView>
    )
}


export default TodoScreen