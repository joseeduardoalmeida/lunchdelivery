import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export const AdminLoadingScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#ef4444" style={styles.spinner} />
        <Text style={styles.text}>Verificando autenticação...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', // equivalente a bg-gray-100
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 16,
  },
  text: {
    color: '#4b5563', // equivalente a text-gray-600
    fontSize: 16,
  },
});
