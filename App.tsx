import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { GameProvider } from './src/context/GameContext';

import LoginScreen      from './src/screens/LoginScreen';
import LobbyScreen      from './src/screens/LobbyScreen';
import AlianzasScreen   from './src/screens/AlianzasScreen';
import TablerScreen     from './src/screens/TablerScreen';
import NegociadorScreen from './src/screens/NegociadorScreen';
import FinJuegoScreen   from './src/screens/FinJuegoScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GameProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#1a0a2e" />
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#1a0a2e' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Login"      component={LoginScreen}      />
          <Stack.Screen name="Lobby"      component={LobbyScreen}      />
          <Stack.Screen name="Alianzas"   component={AlianzasScreen}   />
          <Stack.Screen name="Tablero"    component={TablerScreen}      />
          <Stack.Screen name="Negociador" component={NegociadorScreen} />
          <Stack.Screen name="FinJuego"   component={FinJuegoScreen}   />
        </Stack.Navigator>
      </NavigationContainer>
    </GameProvider>
  );
}
