import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SecureDeliveryLogin } from '../../components/delivery/SecureDeliveryLogin';
import { useSecureDeliveryAuth } from '../../hooks/useSecureDeliveryAuth';

export const DeliverySystem = () => {
  const navigation = useNavigation<any>();
  const { isAuthenticated, isLoading } = useSecureDeliveryAuth();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigation.navigate('DeliveryManagement'); // <-- Nome da tela no seu navigator
    }
  }, [isAuthenticated, isLoading, navigation]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Verificando autenticação...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SecureDeliveryLogin />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
  },
});
