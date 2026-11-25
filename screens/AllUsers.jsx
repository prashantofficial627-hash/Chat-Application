import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { users } from '../data';

// Shows every user. Tap one to open a chat with them.
export default function AllUsers({ navigation }) {
  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.replace('ChatScreen', { user: item })}
    >
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList data={users} renderItem={renderUser} keyExtractor={(item) => item.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  row: { padding: 18, borderBottomWidth: 1, borderBottomColor: '#eee' },
  name: { fontSize: 18 },
});
