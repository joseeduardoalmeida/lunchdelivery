import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useUnifiedProfile } from '../../hooks/useUnifiedProfile';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

const signupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export const CustomerProfile = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  const [showAddAddress, setShowAddAddress] = useState(false);

  const { user, loading: authLoading, isInitialized: authInitialized, signIn, signUp, signOut } = useAuth();
  const { profile, addresses, loading: profileLoading, updateProfile, addAddress } = useUnifiedProfile();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  });

  if (authLoading || !authInitialized || profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}</Text>
          {isLogin ? (
            <View>
              {/** Login Form */}
              <Controller
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
              <Controller
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      style={styles.input}
                      placeholder="Senha"
                      secureTextEntry={!showPassword}
                      value={field.value}
                      onChangeText={field.onChange}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
                    </TouchableOpacity>
                  </View>
                )}
              />
              <TouchableOpacity style={styles.button} onPress={loginForm.handleSubmit(async data => {
                const { error } = await signIn(data.email, data.password);
                if (!error) loginForm.reset();
              })}>
                <Text style={styles.buttonText}>Entrar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/** Signup Form */}
              <Controller
                control={signupForm.control}
                name="name"
                render={({ field }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
              <Controller
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
              <Controller
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    secureTextEntry
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
              <Controller
                control={signupForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar senha"
                    secureTextEntry
                    value={field.value}
                    onChangeText={field.onChange}
                  />
                )}
              />
              <TouchableOpacity style={styles.button} onPress={signupForm.handleSubmit(async data => {
                const { error } = await signUp(data.email, data.password, data.name);
                if (!error) { signupForm.reset(); setIsLogin(true); }
              })}>
                <Text style={styles.buttonText}>Criar conta</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchText}>
            <Text style={{ color: '#fff' }}>{isLogin ? 'Criar conta' : 'Entrar'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Olá, {profile?.name || 'Cliente'}</Text>
      <Text style={styles.subtitle}>{user.email}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={activeTab === 'profile' ? styles.activeTab : styles.tab} onPress={() => setActiveTab('profile')}>
          <Text style={styles.tabText}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={activeTab === 'orders' ? styles.activeTab : styles.tab} onPress={() => setActiveTab('orders')}>
          <Text style={styles.tabText}>Pedidos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={activeTab === 'addresses' ? styles.activeTab : styles.tab} onPress={() => setActiveTab('addresses')}>
          <Text style={styles.tabText}>Endereços</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'profile' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações Pessoais</Text>
          <Text>Nome: {profile?.name}</Text>
          <Text>WhatsApp: {profile?.whatsapp}</Text>
          <Text>Email: {user.email}</Text>
        </View>
      )}

      {activeTab === 'addresses' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Endereços</Text>
          {addresses.map(addr => (
            <View key={addr.id} style={styles.addressCard}>
              <Text>{addr.address}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#1a1a2e' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  loadingText: { color: '#fff', marginTop: 8 },
  card: { backgroundColor: '#222', padding: 16, borderRadius: 12, marginBottom: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { color: '#ccc', fontSize: 14, marginBottom: 8 },
  input: { backgroundColor: '#333', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: '#7b2ff7', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  eyeButton: { position: 'absolute', right: 10, top: 12 },
  switchText: { alignSelf: 'center', marginTop: 8 },
  logoutButton: { backgroundColor: '#f03e3e', padding: 10, borderRadius: 8, marginVertical: 16, alignItems: 'center' },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
  tab: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#333', marginHorizontal: 4, borderRadius: 8 },
  activeTab: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#7b2ff7', marginHorizontal: 4, borderRadius: 8 },
  tabText: { color: '#fff', fontWeight: 'bold' },
  cardTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 8 },
  addressCard: { backgroundColor: '#333', padding: 12, borderRadius: 8, marginBottom: 8 }
});
