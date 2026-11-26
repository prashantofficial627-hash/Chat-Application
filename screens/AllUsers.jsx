import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getSocket, getCurrentUser } from '../socket';

export default function AllUsers({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  // fetch registered users excluding self
  const loadUsers = () => {
    const socket = getSocket();
    socket.emit('get_users', (list) => {
      const others = (list || []).filter((u) => u.id !== currentUser?.id);
      setUsers(others);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadUsers();

    const socket = getSocket();
    socket.on('users_updated', loadUsers);

    return () => {
      socket.off('users_updated', loadUsers);
    };
  }, []);

  const openChat = (user) => {
    navigation.replace('ChatScreen', { user });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.row} onPress={() => openChat(item)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
        {item.isOnline && <View style={styles.onlineBadge} />}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={[styles.status, item.isOnline ? styles.online : styles.offline]}>
          {item.isOnline ? 'Online' : 'Offline'}
        </Text>
      </View>
      <Text style={styles.chatAction}>Message →</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#2196f3" />
        </View>
      ) : users.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No other users online yet.</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 15 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ede7f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#673ab7' },
  onlineBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4caf50',
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  status: { fontSize: 12, marginTop: 2 },
  online: { color: '#2e7d32' },
  offline: { color: '#888' },
  chatAction: { color: '#2196f3', fontSize: 14, fontWeight: '600' },
});
