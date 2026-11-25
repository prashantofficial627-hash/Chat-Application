import * as ImagePicker from 'expo-image-picker';

// Opens the phone gallery and returns the chosen photo's address (uri).
// Returns null if the user cancels.
export async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.5,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0].uri;
}
