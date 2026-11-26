import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export default function CameraScreen({ route, navigation }) {
  const { onPhotoCaptured } = route.params || {};
  const cameraRef = useRef(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [capturing, setCapturing] = useState(false);

  // permission checking
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#2196f3" />
      </View>
    );
  }

  // permission not granted
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.permissionText}>Camera permission is needed to take photos.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Allow Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // pass photo data back to chat screen
  const sendAndClose = (photoData) => {
    if (onPhotoCaptured) {
      onPhotoCaptured(photoData);
    }
    navigation.goBack();
  };

  // take photo using CameraView
  const takePhoto = async () => {
    if (!cameraRef.current || capturing) return;

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.3,
        base64: true,
      });

      if (photo) {
        const photoData = photo.base64
          ? 'data:image/jpeg;base64,' + photo.base64
          : photo.uri;

        sendAndClose(photoData);
      }
    } catch (err) {
      console.log('Camera error:', err);
    } finally {
      setCapturing(false);
    }
  };

  // fallback to phone system camera
  const openSystemCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.4,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const photoData = asset.base64
          ? 'data:image/jpeg;base64,' + asset.base64
          : asset.uri;

        sendAndClose(photoData);
      }
    } catch (err) {
      console.log('System camera error:', err);
    }
  };

  // toggle front/back lens
  const flipCamera = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  // toggle flash
  const toggleFlash = () => {
    setFlash((prev) => (prev === 'off' ? 'on' : 'off'));
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        flash={flash}
        mode="picture"
        ref={cameraRef}
      />

      {/* Top action buttons */}
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.goBack()}>
          <Text style={styles.topIcon}>✕</Text>
        </TouchableOpacity>
        <View style={styles.topRight}>
          <TouchableOpacity style={styles.iconCircle} onPress={toggleFlash}>
            <Text style={styles.topIcon}>{flash === 'on' ? '⚡' : '🚫'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircle} onPress={openSystemCamera}>
            <Text style={styles.topIcon}>📱</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom shutter and flip button */}
      <SafeAreaView style={styles.bottomBar}>
        <TouchableOpacity style={styles.sideBtn} onPress={flipCamera}>
          <Text style={styles.sideIcon}>🔄</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shutter} onPress={takePhoto} disabled={capturing}>
          {capturing ? (
            <ActivityIndicator size="small" color="#2196f3" />
          ) : (
            <View style={styles.shutterInner} />
          )}
        </TouchableOpacity>

        <View style={styles.sideBtn} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  permissionText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  btn: { backgroundColor: '#2196f3', padding: 14, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  cancelBtn: { marginTop: 15, padding: 8 },
  cancelText: { color: '#888' },
  topBar: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topRight: { flexDirection: 'row', gap: 10 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topIcon: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  bottomBar: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  sideBtn: { width: 50, alignItems: 'center' },
  sideIcon: { fontSize: 28 },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
});
