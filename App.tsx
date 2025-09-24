import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text } from "react-native";

const HomeScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>🚀 App funcionando</Text>
  </View>
);

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


// export default App;


// import React from "react";
// import { View, Text } from "react-native";

// const App = () => (
//   <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//     <Text>🚀 App subiu sem dependências</Text>
//   </View>
// );

export default App;

// import 'react-native-reanimated';
// import 'react-native-url-polyfill/auto';
// import 'react-native-get-random-values';
// import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// // import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// // import Toast from "react-native-toast-message";

// import {
//   View,
//   Text
// } from 'react-native'
// // import TooltipProvider from "./src/components/ui/tooltip"; // adapte para RN

// import { useAuthRedirectHandler } from "./src/hooks/useAuthRedirectHandler";
// import { AdminInterface } from "./src/screens/AdminInterface";
// import { AdminLoginPage } from "./src/screens/AdminLogin";
// import { CustomerInterface } from "./src/screens/CustomerInterface";
// import { CustomerProfile } from "./src/screens/CustomerProfile";
// import { PasswordReset } from "./src/screens/PasswordReset";
// import { AuthCallback } from "./src/screens/AuthCallback";
// import NotFound from "./src/screens/NotFound";
// import { DeliveryPage } from "./src/screens/DeliveryPage";
// import { DeliveryManagement } from "./src/screens/DeliveryManagement";
// import { DeliverySystem } from "./src/screens/DeliverySystem";
// import { OrderSuccess } from "./src/screens/OrderSuccess";

// console.log("CustomerInterface:", CustomerInterface);
// console.log("CustomerProfile:", CustomerProfile);
// console.log("PasswordReset:", PasswordReset);
// console.log("AuthCallback:", AuthCallback);
// console.log("AdminLoginPage:", AdminLoginPage);
// console.log("AdminInterface:", AdminInterface);
// console.log("DeliveryPage:", DeliveryPage);
// console.log("DeliveryManagement:", DeliveryManagement);
// console.log("DeliverySystem:", DeliverySystem);
// console.log("OrderSuccess:", OrderSuccess);
// console.log("NotFound:", NotFound);


// const Stack = createNativeStackNavigator();
// // const queryClient = new QueryClient();

// const TestScreen = () => (
//   <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
//     <Text>Tela de teste funcionando ✅</Text>
//   </View>
// );

// const AppRoutes = () => {
//   useAuthRedirectHandler();

//   return (
//     <Stack.Navigator initialRouteName="CustomerInterface" screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="TestScreen" component={TestScreen} />
//     </Stack.Navigator>
//   );
// };

// const App = () => {
//   return (
//     // <QueryClientProvider client={queryClient}>
//         <NavigationContainer>
//           <AppRoutes />
//         </NavigationContainer>
//         // <Toast />
//     // </QueryClientProvider>
//   );
// };

// export default App;
