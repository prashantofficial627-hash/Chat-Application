import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { getMessages, addMessage } from '../data';
import { pickImage } from './ImagePicker';

export default function ChatScreen({ route, navigation }) {
  // the user we are chatting with (sent from the previous screen)
  const { user } = route.params;

  const [messages, setMessages] = useState(getMessages(user.id));
  const [text, setText] = useState('');

  // reload messages when we come back from the camera screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setMessages([...getMessages(user.id)]);
    });
    return unsubscribe;
  }, [navigation]);

  // send a text message
  const sendMessage = () => {
    if (text.trim() === '') {
      return;
    }

    addMessage(user.id, { id: Date.now().toString(), text: text, sender: 'me' });
    setMessages([...getMessages(user.id)]);
    setText('');

    // fake reply after 1 second (no server)
    setTimeout(() => {
      addMessage(user.id, {
        id: (Date.now() + 1).toString(),
        text: 'You said: ' + text,
        sender: 'friend',
      });
      setMessages([...getMessages(user.id)]);
    }, 1000);
  };

  // send a photo from the gallery
  const sendGalleryPhoto = async () => {
    const uri = await pickImage();
    if (uri) {
      addMessage(user.id, { id: Date.now().toString(), image: uri, sender: 'me' });
      setMessages([...getMessages(user.id)]);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === 'me';
    return (
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.friendBubble]}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.photo} />
        ) : (
          <Text style={styles.messageText}>{item.text}</Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />

      <View style={styles.inputRow}>
        <TouchableOpacity onPress={() => navigation.navigate('CameraScreen', { user: user })}>
          <Text style={styles.icon}>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={sendGalleryPhoto}>
          <Text style={styles.icon}>🖼️</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.button} onPress={sendMessage}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  list: { padding: 10 },
  bubble: { maxWidth: '75%', padding: 10, borderRadius: 10, marginVertical: 4 },
  myBubble: { backgroundColor: '#c8e6c9', alignSelf: 'flex-end' },
  friendBubble: { backgroundColor: 'white', alignSelf: 'flex-start' },
  messageText: { fontSize: 16 },
  photo: { width: 180, height: 180, borderRadius: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
  },
  icon: { fontSize: 24, marginRight: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 8,
  },
  button: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
