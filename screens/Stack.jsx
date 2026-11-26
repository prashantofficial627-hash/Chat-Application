import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './LoginScreen';
import Conversations from './Conversations';
import AllUsers from './AllUsers';
import ChatScreen from './ChatScreen';
import CameraScreen from './CameraScreen';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Conversations"
          component={Conversations}
          options={{ title: 'My Chats' }}
        />
        <Stack.Screen
          name="AllUsers"
          component={AllUsers}
          options={{ title: 'Find Friends' }}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={({ route }) => ({
            title: route?.params?.user?.name || 'Chat',
          })}
        />
        <Stack.Screen
          name="CameraScreen"
          component={CameraScreen}
          options={{ title: 'Take Photo' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
