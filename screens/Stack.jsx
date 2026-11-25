import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Conversations from './Conversations';
import AllUsers from './AllUsers';
import ChatScreen from './ChatScreen';
import CameraScreen from './CameraScreen';

const Stack = createNativeStackNavigator();

// This file decides which screens exist and which one opens first
export default function AppStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Conversations">
        <Stack.Screen name="Conversations" component={Conversations} options={{ title: 'Chats' }} />
        <Stack.Screen name="AllUsers" component={AllUsers} options={{ title: 'All Users' }} />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={({ route }) => ({ title: route.params.user.name })}
        />
        <Stack.Screen name="CameraScreen" component={CameraScreen} options={{ title: 'Camera' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
