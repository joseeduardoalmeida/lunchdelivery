import React, { useEffect, useState } from "react";
import {
    View,
    StatusBar,
    Image,
    ImageBackground,
    TouchableOpacity,
    Alert,
    ScrollView,
    Keyboard,
    Platform,
} from "react-native";
import {
    Text,
    NativeBaseProvider,
    Input,
    Button,
    ArrowBackIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    VStack,
    Box,
    FormControl,
    Stack,
    WarningOutlineIcon,
    Divider,
    AlertDialog,
    HStack,
    IconButton,
    CloseIcon,
    Toast,
    useToast
} from "native-base";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import { getManufacturer } from "../../components/DeviceInfo";
import useThemeStore from "../../components/themeStore";
import { WebView } from 'react-native-webview';

const HomeScreen = ({ navigation }) => {

    const [kotlin, setKotlin] = useState("");
    const [swift, setSwift] = useState("");

    useEffect(() => {
        getManufacturer().then(setKotlin);
    }, []);

    const { theme, toggleTheme } = useThemeStore();

    const isDark = theme === 'dark';

    // return <WebView source={{ uri: 'https://lanchonetedoedinho.com.br/' }} style={{ flex: 1 }} />;

    return (
        <View>
            <ScrollView w="100%">
                
            </ScrollView>
        </View>
    );
};

export default HomeScreen;