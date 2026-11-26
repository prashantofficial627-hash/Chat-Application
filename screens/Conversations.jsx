import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getSocket, getCurrentUser, logout } from '../socket';

export default function Conversations({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  // redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigation.replace('LoginScreen');
    }
  }, [currentUser]);

  // load chats from server
  const loadChats = () => {
    if (!currentUser) return;
    const socket = getSocket();
    socket.emit('get_conversations', { userId: currentUser.id }, (data) => {
      setConversations(data || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadChats();

    const socket = getSocket();
    socket.on('conversations_updated', loadChats);
    socket.on('new_message', loadChats);
    socket.on('users_updated', loadChats);

    const unsubscribe = navigation.addListener('focus', loadChats);

    return () => {
      socket.off('conversations_updated', loadChats);
      socket.off('new_message', loadChats);
      socket.off('users_updated', loadChats);
      unsubscribe();
    };
  }, [navigation, currentUser]);

  const handleLogout = () => {
    logout();
    navigation.replace('LoginScreen');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => navigation.navigate('ChatScreen', { user: item })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
        {item.isOnline && <View style={styles.onlineBadge} />}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.status}>{item.isOnline ? 'Online' : 'Offline'}</Text>
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {item.lastMessage || 'No messages yet'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top bar with user name and logout */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSmall}>Logged in as</Text>
          <Text style={styles.headerName}>{currentUser?.name || 'User'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutBtn}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* List of active chats */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#2196f3" />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No chats yet. Tap "New Chat" to begin.</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}

      {/* Button to start chat with any user */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('AllUsers')}
      >
        <Text style={styles.floatingButtonText}>+ New Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerSmall: { fontSize: 12, color: '#888' },
  headerName: { fontSize: 18, fontWeight: 'bold' },
  logoutBtn: { color: '#e53935', fontSize: 14, fontWeight: '600' },
  chatCard: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#1976d2' },
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
  chatInfo: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '600' },
  status: { fontSize: 12, color: '#888' },
  preview: { fontSize: 14, color: '#666', marginTop: 3 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { color: '#888', fontSize: 15 },
  floatingButton: {
    backgroundColor: '#2196f3',
    margin: 16,
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  floatingButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
