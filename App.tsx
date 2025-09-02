import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import TooltipProvider from "./src/components/ui/tooltip"; // adapte para RN

import { useAuthRedirectHandler } from "./src/hooks/useAuthRedirectHandler";
import { AdminInterface } from "./src/screens/AdminInterface";
import { AdminLoginPage } from "./src/screens/AdminLogin";
import { CustomerInterface } from "./src/screens/CustomerInterface";
import { CustomerProfile } from "./src/screens/CustomerProfile";
import { PasswordReset } from "./src/screens/PasswordReset";
import { AuthCallback } from "./src/screens/AuthCallback";
import NotFound from "./src/screens/NotFound";
import { DeliveryPage } from "./src/screens/DeliveryPage";
import { DeliveryManagement } from "./src/screens/DeliveryManagement";
import { DeliverySystem } from "./src/screens/DeliverySystem";
import { OrderSuccess } from "./src/screens/OrderSuccess";

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

const AppRoutes = () => {
  useAuthRedirectHandler();

  return (
    <Stack.Navigator initialRouteName="CustomerInterface" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerInterface" component={CustomerInterface} />
      <Stack.Screen name="CustomerProfile" component={CustomerProfile} />
      <Stack.Screen name="PasswordReset" component={PasswordReset} />
      <Stack.Screen name="AuthCallback" component={AuthCallback} />
      <Stack.Screen name="AdminLoginPage" component={AdminLoginPage} />
      <Stack.Screen name="AdminInterface" component={AdminInterface} />
      <Stack.Screen name="DeliveryPage" component={DeliveryPage} />
      <Stack.Screen name="DeliveryManagement" component={DeliveryManagement} />
      <Stack.Screen name="DeliverySystem" component={DeliverySystem} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccess} />
      <Stack.Screen name="NotFound" component={NotFound} />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <TooltipProvider> */}
        <NavigationContainer>
          <AppRoutes />
        </NavigationContainer>
        <Toast />
      {/* </TooltipProvider> */}
    </QueryClientProvider>
  );
};

export default App;
