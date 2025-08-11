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

const HomeScreen = ({ navigation }) => {

const [kotlin, setKotlin] = useState("");
const [swift, setSwift] = useState("");

useEffect(() => {
    getManufacturer().then(setKotlin);
}, []);

const { theme, toggleTheme } = useThemeStore();

const isDark = theme === 'dark';

    return (
        <View>
            <ScrollView w="100%">
                <Stack space={2.5} alignSelf="center" px="4" safeArea mt="4" w={{
                    base: "100%",
                    md: "25%"
                }}>
                    <Box>
                        <Text bold fontSize="xl" mb="4">
                            Teste técnico
                        </Text>
                        <FormControl mb="5">
                            <FormControl.Label>Informação do fabricante</FormControl.Label>
                            <Input
                                isDisabled
                                value={Platform.OS === "ios" ? swift : kotlin}
                            />
                        </FormControl>
                        <Divider />
                    </Box>

                    <Box>
                         <FormControl mb="5">
                            <FormControl.Label>Tema atual</FormControl.Label>
                            <Input
                                isDisabled
                                value={theme.toUpperCase()}
                            />
                        </FormControl>
                    </Box>

                    
                    <Box>
                        <Button onPress={toggleTheme} >Alterar tema </Button>
                    </Box>
                </Stack>
            </ScrollView>
        </View>
    );
};

export default HomeScreen;