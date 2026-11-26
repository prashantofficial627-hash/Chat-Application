import * as ImagePicker from 'expo-image-picker';

// pick photo from device gallery
export async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.4,
    base64: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  if (asset.base64) {
    return 'data:image/jpeg;base64,' + asset.base64;
  }
  return asset.uri;
}
