import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../integrations/supabase/client';

export interface DeliveryUser {
  id: string;
  username: string;
  email?: string;
  name: string;
  active: boolean;
  created_at: string;
}

export interface DeliverySession {
  user: DeliveryUser;
  sessionToken: string;
  expiresAt: string;
}

class SecureDeliveryAuthService {
  private readonly SESSION_KEY = 'delivery_session_token';
  private readonly EXPIRES_KEY = 'delivery_session_expires';

  async login(
    username: string,
    password: string
  ): Promise<{ session: DeliverySession | null; error: string | null }> {
    try {
      console.log('SecureDeliveryAuthService: Attempting login for:', username);

      const { data, error } = await supabase.functions.invoke('delivery-auth', {
        body: { username: username.trim(), password },
      });

      if (error) {
        console.error('SecureDeliveryAuthService: Login error:', error);
        return { session: null, error: 'Authentication failed' };
      }

      if (data.error) {
        console.error('SecureDeliveryAuthService: Server error:', data.error);
        return { session: null, error: data.error };
      }

      // Store session securely
      await this.storeSession(data.sessionToken, data.expiresAt);

      const session: DeliverySession = {
        user: data.user,
        sessionToken: data.sessionToken,
        expiresAt: data.expiresAt,
      };

      console.log(
        'SecureDeliveryAuthService: Login successful for:',
        data.user.name
      );
      return { session, error: null };
    } catch (error) {
      console.error('SecureDeliveryAuthService: Login exception:', error);
      return { session: null, error: 'Network error' };
    }
  }

  async validateSession(): Promise<{
    user: DeliveryUser | null;
    error: string | null;
  }> {
    try {
      const sessionToken = await this.getStoredSessionToken();

      if (!sessionToken) {
        return { user: null, error: 'No session found' };
      }

      // Check if session expired
      const expiresAt = await AsyncStorage.getItem(this.EXPIRES_KEY);
      if (expiresAt && new Date(expiresAt) <= new Date()) {
        await this.clearSession();
        return { user: null, error: 'Session expired' };
      }

      const { data, error } = await supabase.functions.invoke(
        'validate-delivery-session',
        {
          body: { sessionToken },
        }
      );

      if (error || !data.valid) {
        await this.clearSession();
        return { user: null, error: data?.error || 'Invalid session' };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error(
        'SecureDeliveryAuthService: Session validation error:',
        error
      );
      await this.clearSession();
      return { user: null, error: 'Session validation failed' };
    }
  }

  async logout(): Promise<void> {
    await this.clearSession();
    console.log('SecureDeliveryAuthService: User logged out');
  }

  private async storeSession(
    sessionToken: string,
    expiresAt: string
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SESSION_KEY, sessionToken);
      await AsyncStorage.setItem(this.EXPIRES_KEY, expiresAt);
    } catch (error) {
      console.error('SecureDeliveryAuthService: Failed to store session', error);
    }
  }

  private async getStoredSessionToken(): Promise<string | null> {
    return AsyncStorage.getItem(this.SESSION_KEY);
  }

  private async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SESSION_KEY);
      await AsyncStorage.removeItem(this.EXPIRES_KEY);
    } catch (error) {
      console.error('SecureDeliveryAuthService: Failed to clear session', error);
    }
  }
}

export const secureDeliveryAuthService = new SecureDeliveryAuthService();
