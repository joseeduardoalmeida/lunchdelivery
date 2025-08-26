import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AdminDashboard } from '../../components/admin/AdminDashboard';
import { AdminLoadingScreen } from '../../components/admin/AdminLoadingScreen';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export const AdminInterface = () => {
  const navigation = useNavigation();
  const { isAuthenticated, loading, logout } = useAdminAuth();

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigation.navigate('AdminLogin' as never);
    }
  }, [isAuthenticated, loading, navigation]);

  const handleLogout = async () => {
    await logout();
    navigation.navigate('AdminLogin' as never);
  };

  console.log('AdminInterface: State - loading:', loading, 'authenticated:', isAuthenticated);

  if (loading || !isAuthenticated) {
    return <AdminLoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <AdminDashboard onLogout={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', // equivalente a bg-gray-100
  },
});
