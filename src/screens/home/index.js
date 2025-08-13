import React, { useEffect, useState } from "react";
import { View, StatusBar, StyleSheet, TouchableOpacity } from "react-native";
import { Text, NativeBaseProvider, Button } from "native-base";
import { getManufacturer } from "../../components/DeviceInfo";
import useThemeStore from "../../components/themeStore";
import { WebView } from "react-native-webview";

const HomeScreen = ({ navigation }) => {
  const [kotlin, setKotlin] = useState("");

  useEffect(() => {
    getManufacturer().then(setKotlin);
  }, []);

  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <NativeBaseProvider>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text fontSize="lg" bold color="white">
            Lunch delivery
          </Text>
        </View>

        {/* CONTEÚDO (WEBVIEW) */}
        <WebView
          source={{ uri: "https://lanchonetedoedinho.com.br/" }}
          style={styles.webview}
        />

        {/* FOOTER */}
        <View style={styles.footer}>
          <Button size="sm" onPress={() => navigation.navigate("OutraTela")}>
            Ir para outra tela
          </Button>
        </View>
      </View>
    </NativeBaseProvider>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    backgroundColor: "#E53935",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  webview: {
    flex: 1,
  },
  footer: {
    backgroundColor: "#E53935",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

// import React, { useEffect, useState } from "react";
// import { View, StatusBar, StyleSheet, TouchableOpacity } from "react-native";
// import { WebView } from "react-native-webview";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import { getManufacturer } from "../../components/DeviceInfo";
// import useThemeStore from "../../components/themeStore";

// const HomeScreen = ({ navigation }) => {
//   const [kotlin, setKotlin] = useState("");

//   useEffect(() => {
//     getManufacturer().then(setKotlin);
//   }, []);

//   const { theme, toggleTheme } = useThemeStore();
//   const isDark = theme === "dark";

//   return (
//     <View style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#fff" }}>
//       <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

//       {/* HEADER */}
//       <View style={[styles.header, { backgroundColor: isDark ? "#1f1f1f" : "#6200ee" }]}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <Ionicons name="restaurant" size={24} color="#fff" style={{ marginLeft: 10 }} />
//         <View style={{ flex: 1 }} />
//         <TouchableOpacity onPress={toggleTheme}>
//           <MaterialIcons name={isDark ? "light-mode" : "dark-mode"} size={24} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/* CONTEÚDO */}
//       <WebView source={{ uri: "https://lanchonetedoedinho.com.br/" }} style={{ flex: 1 }} />

//       {/* FOOTER */}
//       <View style={[styles.footer, { backgroundColor: isDark ? "#1f1f1f" : "#6200ee" }]}>
//         <TouchableOpacity style={styles.footerButton}>
//           <Ionicons name="home" size={24} color="#fff" />
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.footerButton}>
//           <Ionicons name="cart" size={24} color="#fff" />
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.footerButton}>
//           <Ionicons name="person" size={24} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default HomeScreen;

// const styles = StyleSheet.create({
//   header: {
//     height: 50,
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 15,
//     elevation: 4
//   },
//   footer: {
//     height: 50,
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     elevation: 4
//   },
//   footerButton: {
//     padding: 8
//   }
// });
