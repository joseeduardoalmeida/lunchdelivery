import React, { useEffect, useState } from "react";
import {
    View,
    ScrollView,
} from "react-native";
import {
    Text,
    Input,
    Button,
    Box,
    FormControl,
    Stack,
    Divider,
    useToast
} from "native-base";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "../../settings/AuthContext";

const LoginScreen = ({ navigation }) => {

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: "",
            senha: "",
        },
    });
    const toast = useToast();

    const { user, signOut, signIn } = useAuth();

    const onSubmit = (data) => {
        if(data.email == "josee.almeida@outlook.com" && data.senha == "teste123"){
            signIn(data);
            navigation.navigate("Home");
        }
        else
            toast.show({description: "E-mail ou senha incorretos"})
    };

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
                            <FormControl.Label>E-mail</FormControl.Label>
                            <Controller
                                control={control}
                                rules={{
                                    required: true,
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                                name="email"
                            />
                            {errors.email && <Text color={"#FF0000"}>Campo obrigatório.</Text>}
                        </FormControl>
                        <Divider />
                    </Box>
                    <Box>
                        <FormControl mb="5">
                            <FormControl.Label>
                                Senha
                            </FormControl.Label>
                            <Controller
                                control={control}
                                rules={{
                                    required: true,
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        type="password"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                                name="senha"
                            />
                            {errors.senha && <Text color={"#FF0000"}>Informe a senha para prosseguir.</Text>}
                        </FormControl>
                        <Divider />
                    </Box>
                    <Box>
                        <Button onPress={handleSubmit(onSubmit)} >Entrar </Button>
                    </Box>
                </Stack>
            </ScrollView>
        </View>
    );
};

export default LoginScreen;