import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { addMessage } from '../data';

// Opens the camera, takes a photo and adds it to the chat
export default function CameraScreen({ route, navigation }) {
  const { user } = route.params;
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  // still checking permission
  if (!permission) {
    return <View />;
  }

  // permission not given yet, ask for it
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>We need your permission to use the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    const photo = await cameraRef.current.takePictureAsync();
    addMessage(user.id, { id: Date.now().toString(), image: photo.uri, sender: 'me' });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} />
      <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
        <Text style={styles.buttonText}>Take Photo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  message: { fontSize: 16, marginBottom: 15, textAlign: 'center' },
  button: { backgroundColor: '#2196f3', padding: 12, borderRadius: 8 },
  captureButton: {
    backgroundColor: '#2196f3',
    padding: 16,
    margin: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
