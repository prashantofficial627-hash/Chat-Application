import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { users, getMessages } from '../data';

// Home screen: shows the list of chats that already have messages
export default function Conversations({ navigation }) {
  const [chatList, setChatList] = useState([]);

  // find users who have at least one message
  const loadChats = () => {
    const list = users.filter((user) => getMessages(user.id).length > 0);
    setChatList(list);
  };

  // reload the list every time this screen comes back into view
  useEffect(() => {
    loadChats();
    const unsubscribe = navigation.addListener('focus', loadChats);
    return unsubscribe;
  }, [navigation]);

  const renderChat = ({ item }) => {
    const messages = getMessages(item.id);
    const last = messages[messages.length - 1];
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('ChatScreen', { user: item })}
      >
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.lastMessage}>{last.image ? 'Photo' : last.text}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {chatList.length === 0 ? (
        <Text style={styles.empty}>No chats yet. Tap "New Chat" to start.</Text>
      ) : (
        <FlatList data={chatList} renderItem={renderChat} keyExtractor={(item) => item.id} />
      )}

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AllUsers')}>
        <Text style={styles.buttonText}>New Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  row: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  name: { fontSize: 18, fontWeight: 'bold' },
  lastMessage: { color: 'gray', marginTop: 3 },
  empty: { textAlign: 'center', marginTop: 50, color: 'gray' },
  button: {
    backgroundColor: '#2196f3',
    margin: 15,
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
