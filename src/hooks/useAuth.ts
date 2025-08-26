import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { Alert, Linking } from 'react-native';
import { useToast } from '../hooks/use-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast(); // opcional, pode usar Alert

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (!isInitialized) setIsInitialized(true);
      }
    );

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting initial session:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setIsInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) {
        toast?.({ title: 'Erro no cadastro', description: error.message, variant: 'destructive' });
        return { error };
      }

      Alert.alert('Cadastro realizado!', 'Conta criada com sucesso! Você já pode fazer login.');
      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        let errorMessage = error.message.includes('invalid_credentials')
          ? 'Email ou senha incorretos. Verifique suas credenciais.'
          : error.message;

        toast?.({ title: 'Erro no login', description: errorMessage, variant: 'destructive' });
        return { error };
      }

      Alert.alert('Login realizado!', 'Bem-vindo de volta!');
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      toast?.({ title: 'Erro no login', description: 'Erro interno. Tente novamente.', variant: 'destructive' });
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast?.({ title: 'Email inválido', description: 'Por favor, insira um email válido.', variant: 'destructive' });
        return { error: new Error('Invalid email format') };
      }

      // Use deep link ou URL web válida
      const redirectUrl = 'myapp://auth-callback'; // ajuste para seu deep link
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });

      if (error) {
        let errorMessage = error.message.includes('user_not_found')
          ? 'Email não encontrado. Verifique se o email está correto.'
          : error.message;

        toast?.({ title: 'Erro', description: errorMessage, variant: 'destructive' });
        return { error };
      }

      Alert.alert('Email enviado!', 'Verifique sua caixa de entrada para redefinir sua senha.');
      return { error: null };
    } catch (error) {
      console.error('Reset password unexpected error:', error);
      toast?.({ title: 'Erro', description: 'Erro interno. Tente novamente.', variant: 'destructive' });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast?.({ title: 'Erro', description: 'Erro ao fazer logout', variant: 'destructive' });
        return;
      }
      Alert.alert('Logout realizado', 'Até logo!');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    user,
    session,
    loading,
    isInitialized,
    signUp,
    signIn,
    signOut,
    resetPassword
  };
}
