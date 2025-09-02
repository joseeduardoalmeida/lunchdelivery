import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { DeliveryUser, secureDeliveryAuthService } from '../services/secureDeliveryAuthService';

export const useSecureDeliveryAuth = () => {
  const navigation = useNavigation<any>(); // 👈 tipagem flexível, pode trocar para RootStackParamList se já tiver
  const [user, setUser] = useState<DeliveryUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      setIsLoading(true);
      try {
        const { user: validatedUser, error } =
          await secureDeliveryAuthService.validateSession();

        if (validatedUser && !error) {
          setUser(validatedUser);
          setIsAuthenticated(true);
          console.log(
            'useSecureDeliveryAuth: Session validated for:',
            validatedUser.name
          );
        } else {
          setUser(null);
          setIsAuthenticated(false);
          console.log('useSecureDeliveryAuth: No valid session found');
        }
      } catch (error) {
        console.error('useSecureDeliveryAuth: Session validation error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();

    // Verifica sessão a cada 60s
    const interval = setInterval(() => {
      if (isAuthenticated) {
        validateSession();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { session, error } = await secureDeliveryAuthService.login(
        username,
        password
      );

      if (session && !error) {
        setUser(session.user);
        setIsAuthenticated(true);
        console.log(
          'useSecureDeliveryAuth: Login successful for:',
          session.user.name
        );

        // 👇 Redireciona no React Native
        navigation.navigate('DeliveryManagement');

        return { success: true };
      } else {
        return { success: false, error: error || 'Login failed' };
      }
    } catch (error) {
      console.error('useSecureDeliveryAuth: Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    secureDeliveryAuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    console.log('useSecureDeliveryAuth: User logged out');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};
