import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../../integrations/supabase/client';
import { usePasswordReset } from '../../hooks/usePasswordReset';
import { configChecker } from '../../utils/supabaseConfigChecker';

const passwordResetSchema = z.object({
  password: z.string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'),
  confirmPassword: z.string().min(1, 'Confirme sua senha')
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

export function PasswordReset() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requestingNewLink, setRequestingNewLink] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [configurationSummary, setConfigurationSummary] = useState<string | null>(null);
  
  const navigation = useNavigation();

  const { 
    sessionResult, 
    requestNewResetLink,
    updatePassword
  } = usePasswordReset();

  const isValidSession = sessionResult?.isValid ?? null;
  const userEmail = sessionResult?.userEmail;
  const errorDetails = sessionResult?.errorDetails;
  const debugInfo = sessionResult?.debugInfo;

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    formState: { errors } 
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema)
  });

  const watchPassword = watch('password', '');

  useEffect(() => {
    const calculateStrength = (password: string) => {
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (/[a-z]/.test(password)) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;
      return strength;
    };
    setPasswordStrength(calculateStrength(watchPassword));
  }, [watchPassword]);

  useEffect(() => {
  const fetchSummary = async () => {
    if (isValidSession === false && configChecker) {
      const configSummary = await configChecker.getConfigurationSummary();
      setConfigurationSummary(configSummary);
    }
  };
  fetchSummary();
}, [isValidSession]);

  const handleRequestNewLink = async () => {
    setRequestingNewLink(true);
    try {
      await requestNewResetLink();
    } finally {
      setRequestingNewLink(false);
    }
  };

  const onSubmit = async (data: PasswordResetFormData) => {
    setLoading(true);
    try {
      const success = await updatePassword(data.password);
      if (success) {
        await supabase.auth.signOut();
        setTimeout(() => {
          navigation.navigate('Perfil' as never);
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isValidSession === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.infoText}>Verificando sessão...</Text>
      </View>
    );
  }

  if (isValidSession === false) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.errorTitle}>
          <Icon name="alert-circle" size={18} color="red" /> Acesso Negado
        </Text>
        <Text style={styles.infoText}>
          O link de recuperação é inválido ou expirou.
        </Text>

        {userEmail && (
          <TouchableOpacity 
            style={styles.button} 
            disabled={requestingNewLink} 
            onPress={handleRequestNewLink}
          >
            {requestingNewLink ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Solicitar Novo Link</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.button, styles.outlineButton]} 
          onPress={() => navigation.navigate('Perfil' as never)}
        >
          <Text style={styles.outlineButtonText}>Voltar ao Login</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        <Icon name="lock" size={18} color="#007AFF" /> Redefinir Senha
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nova Senha</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            secureTextEntry={!showPassword}
            placeholder="Digite sua nova senha"
            onChangeText={(text) => setValue('password', text, { shouldValidate: true })}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirmar Nova Senha</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            secureTextEntry={!showConfirmPassword}
            placeholder="Confirme sua nova senha"
            onChangeText={(text) => setValue('confirmPassword', text, { shouldValidate: true })}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
      </View>

      {watchPassword ? (
        <View style={styles.strengthBox}>
          <Text>Força da senha: {passwordStrength < 50 ? 'Fraca' : passwordStrength < 75 ? 'Média' : 'Forte'}</Text>
        </View>
      ) : null}

      <TouchableOpacity 
        style={[styles.button, (loading || passwordStrength < 75) && styles.disabledButton]} 
        onPress={handleSubmit(onSubmit)} 
        disabled={loading || passwordStrength < 75}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Alterar Senha</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#555',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 18,
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    marginTop: 4,
    color: 'red',
    fontSize: 12,
  },
  strengthBox: {
    marginBottom: 16,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  outlineButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  outlineButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
