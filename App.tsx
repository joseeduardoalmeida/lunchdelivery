import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/settings/AuthContext';

import LoginScreen from './src/screens/login';
import HomeScreen from './src/screens/home';
import AboutScreen from './src/screens/about';
import AdminScreen from './src/screens/admin';
import DeliveryScreen from './src/screens/delivery';
import WaiterScreen from './src/screens/waiter';
import { NativeBaseProvider } from 'native-base';

// import { enableScreens } from 'react-native-screens';
// enableScreens();

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <AuthProvider>
      <NativeBaseProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Admin" component={AdminScreen} />
            <Stack.Screen name="Delivery" component={DeliveryScreen} />
            <Stack.Screen name="Waiter" component={WaiterScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </NativeBaseProvider>
    </AuthProvider>
  );
};

export default App;