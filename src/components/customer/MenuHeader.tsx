import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Linking } from 'react-native';
import { pageSettingsService, HeaderSettings } from '../../services/pageSettingsService';
import { Truck } from 'lucide-react-native'; // use pacote compatível com React Native
import LinearGradient from 'react-native-linear-gradient';

export const MenuHeader = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({ image_url: '', enabled: false });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const loadHeaderSettings = async () => {
            try {
                const settings = await pageSettingsService.getHeaderSettings();
                setHeaderSettings(settings);
            } catch (error) {
                console.error('Error loading header settings:', error);
            }
        };
        loadHeaderSettings();
    }, []);

    const openDelivery = () => {
        Linking.openURL('https://yourapp.com/delivery'); // ajuste para seu link
    };

    const Container = headerSettings.enabled && headerSettings.image_url
        ? ImageBackground
        : View;

    const containerProps = headerSettings.enabled && headerSettings.image_url
        ? { source: { uri: headerSettings.image_url }, resizeMode: 'cover' }
        : {};

    return (
        headerSettings.enabled && headerSettings.image_url ?
            <ImageBackground
                source={{ uri: headerSettings.image_url }}
                resizeMode="cover"
                style={styles.container}
            >
                {headerSettings.enabled && headerSettings.image_url && (
                    <LinearGradient
                        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.4)']}
                        style={StyleSheet.absoluteFill}
                    />
                )}

                <View style={styles.topRow}>
                    <TouchableOpacity style={styles.deliveryButton} onPress={openDelivery}>
                        <Truck size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.deliveryButtonText}>Pedir Delivery</Text>
                    </TouchableOpacity>

                    <View style={styles.timeContainer}>
                        <Text style={[
                            styles.timeText,
                            headerSettings.enabled && headerSettings.image_url ? { color: '#fff' } : { color: '#8B0000' }
                        ]}>
                            {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <Text style={[
                            styles.dateText,
                            headerSettings.enabled && headerSettings.image_url ? { color: '#E5E7EB' } : { color: '#4B5563' }
                        ]}>
                            {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </Text>
                    </View>
                </View>

                <View style={[
                    styles.promoContainer,
                    headerSettings.enabled && headerSettings.image_url
                        ? { backgroundColor: 'rgba(255,255,255,0.2)' }
                        : { backgroundColor: 'rgba(255, 223, 0, 0.2)' }
                ]}>
                    <Text style={[
                        styles.promoText,
                        headerSettings.enabled && headerSettings.image_url ? { color: '#fff' } : { color: '#8B0000' }
                    ]}>
                        🎉 PEÇA PELO APP E CONCORRA A UMA PIZZA TODA SEMANA!
                    </Text>
                </View>
            </ImageBackground>
            : <View style={styles.container}>
                {headerSettings.enabled && headerSettings.image_url && (
                    <LinearGradient
                        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.4)']}
                        style={StyleSheet.absoluteFill}
                    />
                )}

                <View style={styles.topRow}>
                    <TouchableOpacity style={styles.deliveryButton} onPress={openDelivery}>
                        <Truck size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.deliveryButtonText}>Pedir Delivery</Text>
                    </TouchableOpacity>

                    <View style={styles.timeContainer}>
                        <Text style={[
                            styles.timeText,
                            headerSettings.enabled && headerSettings.image_url ? { color: '#fff' } : { color: '#8B0000' }
                        ]}>
                            {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <Text style={[
                            styles.dateText,
                            headerSettings.enabled && headerSettings.image_url ? { color: '#E5E7EB' } : { color: '#4B5563' }
                        ]}>
                            {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </Text>
                    </View>
                </View>

                <View style={[
                    styles.promoContainer,
                    headerSettings.enabled && headerSettings.image_url
                        ? { backgroundColor: 'rgba(255,255,255,0.2)' }
                        : { backgroundColor: 'rgba(255, 223, 0, 0.2)' }
                ]}>
                    <Text style={[
                        styles.promoText,
                        headerSettings.enabled && headerSettings.image_url ? { color: '#fff' } : { color: '#8B0000' }
                    ]}>
                        🎉 PEÇA PELO APP E CONCORRA A UMA PIZZA TODA SEMANA!
                    </Text>
                </View>
            </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        overflow: 'hidden',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    deliveryButton: {
        flexDirection: 'row',
        backgroundColor: '#16A34A',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 999,
        alignItems: 'center',
    },
    deliveryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    timeContainer: {
        alignItems: 'flex-end',
    },
    timeText: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 18,
    },
    promoContainer: {
        marginTop: 16,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    promoText: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
});
