import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Truck, User, Lock } from 'lucide-react-native';
import { useToast } from '../../hooks/use-toast';
import { useSecureDeliveryAuth } from '../../hooks/useSecureDeliveryAuth';

export const SecureDeliveryLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useSecureDeliveryAuth();

  const handleSubmit = async () => {
    if (!username.trim() || !password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha usuário e senha.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('SecureDeliveryLogin: Attempting login for:', username);

      const { success, error } = await login(username.trim(), password);

      if (success) {
        console.log('SecureDeliveryLogin: Login successful');
        toast({
          title: 'Login realizado!',
          description: 'Bem-vindo ao sistema de entregas!',
        });
      } else {
        console.error('SecureDeliveryLogin: Login failed:', error);
        toast({
          title: 'Erro no login',
          description: error || 'Credenciais inválidas',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('SecureDeliveryLogin: Unexpected error:', err);
      toast({
        title: 'Erro no login',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Ícone */}
        <View style={styles.iconContainer}>
          <Truck size={32} color="#2563eb" />
        </View>

        {/* Título */}
        <Text style={styles.title}>Login Seguro - Motoboy</Text>
        <Text style={styles.subtitle}>Entre com suas credenciais</Text>

        {/* Campo Usuário */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <User size={16} color="#374151" />
            <Text style={styles.label}>Usuário</Text>
          </View>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Digite seu usuário"
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        {/* Campo Senha */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Lock size={16} color="#374151" />
            <Text style={styles.label}>Senha</Text>
          </View>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Digite sua senha"
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        {/* Botão */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔒 Sistema Seguro: Suas credenciais são protegidas por criptografia avançada
          </Text>
        </View>
      </View>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  iconContainer: {
    backgroundColor: '#dbeafe',
    alignSelf: 'center',
    padding: 12,
    borderRadius: 50,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1f2937',
  },
  subtitle: {
    textAlign: 'center',
    color: '#4b5563',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#ecfdf5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  footerText: {
    fontSize: 12,
    color: '#047857',
    textAlign: 'center',
  },
});
