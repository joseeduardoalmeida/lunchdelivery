import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Linking, Alert } from 'react-native';

interface AuthParams {
  access_token: string | null;
  refresh_token: string | null;
  type: string | null;
  error: string | null;
  error_description: string | null;
  expires_in: string | null;
  expires_at: string | null;
  token_type: string | null;
}

interface SessionCheckResult {
  isValid: boolean;
  userEmail: string | null;
  errorDetails: string | null;
  debugInfo: any;
}

export function usePasswordReset() {
  const [sessionResult, setSessionResult] = useState<SessionCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Parse auth parameters from deep link
  const parseAuthParams = useCallback(async (): Promise<AuthParams> => {
    const initialUrl = await Linking.getInitialURL();
    if (!initialUrl) {
      return {
        access_token: null,
        refresh_token: null,
        type: null,
        error: null,
        error_description: null,
        expires_in: null,
        expires_at: null,
        token_type: null
      };
    }

    const url = new URL(initialUrl);
    const fragmentParams = new URLSearchParams(url.hash.replace('#', ''));
    const queryParams = new URLSearchParams(url.search);

    return {
      access_token: fragmentParams.get('access_token') || queryParams.get('access_token'),
      refresh_token: fragmentParams.get('refresh_token') || queryParams.get('refresh_token'),
      type: fragmentParams.get('type') || queryParams.get('type'),
      error: fragmentParams.get('error') || queryParams.get('error'),
      error_description: fragmentParams.get('error_description') || queryParams.get('error_description'),
      expires_in: fragmentParams.get('expires_in') || queryParams.get('expires_in'),
      expires_at: fragmentParams.get('expires_at') || queryParams.get('expires_at'),
      token_type: fragmentParams.get('token_type') || queryParams.get('token_type')
    };
  }, []);

  // Validate and set session
  const validateSession = useCallback(async (): Promise<SessionCheckResult> => {
    try {
      console.log('🔍 Starting session validation...');

      const authParams = await parseAuthParams();
      const debugInfo = {
        authParams,
        timestamp: new Date().toISOString()
      };

      if (authParams.error) {
        let errorMessage = authParams.error_description || 'Erro na autenticação';
        return { isValid: false, userEmail: null, errorDetails: errorMessage, debugInfo };
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        return { isValid: false, userEmail: null, errorDetails: sessionError.message, debugInfo };
      }

      if (authParams.type === 'recovery' && authParams.access_token && authParams.refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token: authParams.access_token,
          refresh_token: authParams.refresh_token
        });

        if (error) {
          return { isValid: false, userEmail: null, errorDetails: error.message, debugInfo };
        }

        if (data.session?.user) {
          return {
            isValid: true,
            userEmail: data.session.user.email || null,
            errorDetails: null,
            debugInfo
          };
        }
      }

      if (session?.user) {
        return {
          isValid: true,
          userEmail: session.user.email || null,
          errorDetails: null,
          debugInfo
        };
      }

      return {
        isValid: false,
        userEmail: null,
        errorDetails: 'Nenhuma sessão válida encontrada.',
        debugInfo
      };
    } catch (error) {
      return {
        isValid: false,
        userEmail: null,
        errorDetails: error instanceof Error ? error.message : 'Erro inesperado',
        debugInfo: { error }
      };
    }
  }, [parseAuthParams]);

  // Check session with timeout
  const checkSession = useCallback(async () => {
    if (timeoutId) clearTimeout(timeoutId);

    const newTimeoutId = setTimeout(() => {
      setSessionResult({
        isValid: false,
        userEmail: null,
        errorDetails: 'Tempo limite excedido. Verifique sua conexão.',
        debugInfo: { timeout: true }
      });
      setLoading(false);
    }, 8000);

    setTimeoutId(newTimeoutId);

    try {
      const result = await validateSession();
      clearTimeout(newTimeoutId);
      setTimeoutId(null);
      setSessionResult(result);
      setLoading(false);
    } catch (error) {
      clearTimeout(newTimeoutId);
      setTimeoutId(null);
      setSessionResult({
        isValid: false,
        userEmail: null,
        errorDetails: error instanceof Error ? error.message : 'Erro desconhecido',
        debugInfo: { error }
      });
      setLoading(false);
    }
  }, [validateSession, timeoutId]);

  // Request new reset link
  const requestNewResetLink = useCallback(async (email?: string): Promise<boolean> => {
    const userEmail = email || sessionResult?.userEmail;
    if (!userEmail) {
      Alert.alert("Erro", "Email não encontrado. Volte para a tela de login.");
      return false;
    }

    try {
      const redirectUrl = "myapp://auth-callback"; // deep link configurado no app.json
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: redirectUrl
      });

      if (error) {
        Alert.alert("Erro", error.message);
        return false;
      }

      Alert.alert("Sucesso", "Um novo link de recuperação foi enviado para seu email.");
      return true;
    } catch {
      Alert.alert("Erro", "Erro ao solicitar novo link. Tente novamente.");
      return false;
    }
  }, [sessionResult?.userEmail]);

  // Update password
  const updatePassword = useCallback(async (newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        Alert.alert("Erro", error.message);
        return false;
      }
      Alert.alert("Sucesso", "Sua senha foi alterada com sucesso.");
      return true;
    } catch {
      Alert.alert("Erro", "Erro interno. Tente novamente.");
      return false;
    }
  }, []);

  useEffect(() => {
    checkSession();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return {
    sessionResult,
    loading,
    checkSession,
    requestNewResetLink,
    updatePassword
  };
}
