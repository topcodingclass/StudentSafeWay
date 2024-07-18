import React, { useState } from 'react';
import { Button, Image, View, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {db} from '../firebase'

const ImageTest = ({navigation}) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      console.log(result.assets[0].uri)
    } else {
      alert('You did not select any image.');
    }
  };


  const uploadImage = async () => {
    
  };

return (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Button title="Pick an image from camera roll" onPress={pickImageAsync} />
    {selectedImage && <Image source={{ uri: selectedImage }} style={{ width: 200, height: 200 }} />}
    {selectedImage && <Button title="Upload Image" onPress={uploadImage} />}
  </View>
);}

export default ImageTest