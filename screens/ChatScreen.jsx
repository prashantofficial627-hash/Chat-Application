import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { getSocket, getCurrentUser } from '../socket';
import { pickImage } from './ImagePicker';

export default function ChatScreen({ route, navigation }) {
  const { user: friend } = route.params;
  const currentUser = getCurrentUser();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  // load chat history and listen for new messages
  useEffect(() => {
    if (!currentUser || !friend) return;

    const socket = getSocket();

    // fetch past messages
    socket.emit(
      'get_messages',
      { userId: currentUser.id, friendId: friend.id },
      (history) => {
        setMessages(history || []);
        setLoading(false);
      }
    );

    // real-time listener for incoming messages
    const onNewMessage = (msg) => {
      const isThisConversation =
        (msg.senderId === currentUser.id && msg.receiverId === friend.id) ||
        (msg.senderId === friend.id && msg.receiverId === currentUser.id);

      if (isThisConversation) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on('new_message', onNewMessage);

    return () => {
      socket.off('new_message', onNewMessage);
    };
  }, [currentUser, friend]);

  // show message in UI immediately
  const appendLocalMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // send a text message
  const sendMessage = () => {
    if (!text.trim()) return;

    const messageText = text.trim();
    setText('');

    const newMsg = {
      id: Date.now().toString(),
      senderId: currentUser?.id || 'me',
      receiverId: friend.id,
      text: messageText,
      image: null,
      createdAt: new Date().toISOString(),
    };

    appendLocalMessage(newMsg);

    // emit to server
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('send_message', {
        senderId: currentUser?.id || 'me',
        receiverId: friend.id,
        text: messageText,
      });
    }
  };

  // send photo from camera or gallery
  const sendPhoto = (photoData) => {
    if (!photoData) return;

    const newMsg = {
      id: Date.now().toString(),
      senderId: currentUser?.id || 'me',
      receiverId: friend.id,
      text: '',
      image: photoData,
      createdAt: new Date().toISOString(),
    };

    appendLocalMessage(newMsg);

    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('send_message', {
        senderId: currentUser?.id || 'me',
        receiverId: friend.id,
        image: photoData,
      });
    }
  };

  // pick photo from gallery
  const handlePickGallery = async () => {
    const photo = await pickImage();
    if (photo) {
      sendPhoto(photo);
    }
  };

  // navigate to camera screen
  const handleOpenCamera = () => {
    navigation.navigate('CameraScreen', {
      user: friend,
      onPhotoCaptured: (photo) => sendPhoto(photo),
    });
  };

  // render individual message bubble
  const renderMessage = ({ item }) => {
    const isMe = item.senderId === currentUser?.id;
    const time = item.createdAt
      ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.friendBubble]}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.photo} resizeMode="cover" />
        ) : null}
        {item.text ? <Text style={styles.messageText}>{item.text}</Text> : null}
        {time ? <Text style={styles.timeText}>{time}</Text> : null}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#2196f3" />
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Say hello to {friend.name}!</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={handleOpenCamera}>
          <Text style={styles.icon}>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={handlePickGallery}>
          <Text style={styles.icon}>🖼️</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
        />

        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!text.trim()}
        >
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#efeae2' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 16 },
  messageList: { padding: 12 },
  bubble: {
    maxWidth: '80%',
    padding: 8,
    borderRadius: 12,
    marginVertical: 4,
  },
  myBubble: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  friendBubble: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  messageText: { fontSize: 15, paddingHorizontal: 4 },
  timeText: { fontSize: 10, color: '#777', alignSelf: 'flex-end', marginTop: 3 },
  photo: {
    width: 220,
    height: 180,
    borderRadius: 8,
    marginBottom: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f6f6f6',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  iconBtn: { padding: 6 },
  icon: { fontSize: 22 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sendBtn: {
    backgroundColor: '#00a884',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  sendBtnDisabled: { backgroundColor: '#b0bec5' },
  sendBtnText: { color: '#fff', fontWeight: 'bold' },
});
