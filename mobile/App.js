import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext, AuthProvider } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import RoomListScreen from './src/screens/RoomListScreen';
import ChatScreen from './src/screens/ChatScreen';
import CreateRoomScreen from './src/screens/CreateRoomScreen';
import OnlineUsersScreen from './src/screens/OnlineUsersScreen';

const Stack = createNativeStackNavigator();

import { SafeAreaProvider } from 'react-native-safe-area-context';

function AppNavigation() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    // A clean fallback loader matching the web loader
    return null; 
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ headerShown: false }} 
            />
          </>
        ) : (
          // App Stack
          <>
            <Stack.Screen 
              name="RoomList" 
              component={RoomListScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen} 
              // Custom header is defined inside ChatScreen.js
            />
            <Stack.Screen 
              name="CreateRoom" 
              component={CreateRoomScreen} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="OnlineUsers" 
              component={OnlineUsersScreen} 
              options={{ headerShown: false }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SocketProvider>
          <AppNavigation />
        </SocketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
