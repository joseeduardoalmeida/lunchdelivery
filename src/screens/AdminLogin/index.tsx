import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AdminLogin } from '../../components/admin/AdminLogin';
import { AdminLoadingScreen } from '../../components/admin/AdminLoadingScreen';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export const AdminLoginPage = () => {
  const navigation = useNavigation<any>();
  const { isAuthenticated, loading } = useAdminAuth();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigation.navigate('AdminDashboard'); // nome da tela de admin
    }
  }, [isAuthenticated, loading, navigation]);

  if (loading || isAuthenticated) {
    return <AdminLoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <AdminLogin />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', // equivalente ao bg-gray-100
  },
});
