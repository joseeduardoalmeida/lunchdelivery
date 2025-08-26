import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const checkIfUserIsAdmin = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Exception checking admin status:', error);
      return false;
    }
  };

  const handleAuthUser = async (currentUser: User | null) => {
    if (!currentUser) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const isAdmin = await checkIfUserIsAdmin(currentUser.id);

      if (isAdmin) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        await supabase.auth.signOut();
        setUser(null);
        setIsAuthenticated(false);
        toast({
          title: "Acesso negado",
          description: "Usuário não tem permissões de administrador.",
          variant: "destructive",
        });
        // Também pode exibir alerta nativo
        Alert.alert("Acesso negado", "Usuário não tem permissões de administrador.");
      }
    } catch (error) {
      console.error('Error processing user:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          await handleAuthUser(session.user);
        } else {
          setLoading(false);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    const setupListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!isMounted || !isInitialized) return;

          if (event === 'SIGNED_OUT') {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
          } else if (event === 'SIGNED_IN' && session?.user) {
            if (!isAuthenticated || user?.id !== session.user.id) {
              setLoading(true);
              await handleAuthUser(session.user);
            }
          }
        }
      );

      return subscription;
    };

    initializeAuth().then(() => {
      if (isMounted) {
        const subscription = setupListener();
        return () => subscription.unsubscribe();
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      Alert.alert("Logout realizado", "Você foi desconectado com sucesso.");
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao fazer logout.",
        variant: "destructive",
      });
      Alert.alert("Erro", "Ocorreu um erro ao fazer logout.");
    } finally {
      setLoading(false);
    }
  };

  return {
    isAuthenticated,
    user,
    loading,
    logout
  };
};
