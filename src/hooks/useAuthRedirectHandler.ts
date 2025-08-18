import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function useAuthRedirectHandler() {
  const navigation = useNavigation();

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) return;

      // Extrai hash e query params
      const [base, queryString] = url.split('?');
      const [path, hashString] = base.split('#');

      const hashParams = new URLSearchParams(hashString);
      const searchParams = new URLSearchParams(queryString);

      const type = hashParams.get('type') || searchParams.get('type');
      const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');

      console.log('🔍 Auth redirect detected:', { url, type, hasTokens: !!(accessToken && refreshToken) });

      if (type && (accessToken || type === 'signup' || type === 'invite' || type === 'magiclink')) {
        console.log('🔄 Navigating to AuthCallback screen');
        // Redireciona para a tela AuthCallback
        navigation.navigate('AuthCallback' as never);
      }
    };

    // Verifica URL inicial (quando o app é aberto via deep link)
    Linking.getInitialURL().then(handleUrl);

    // Ouve eventos de deep link enquanto o app está aberto
    const subscription = Linking.addEventListener('url', event => handleUrl(event.url));

    return () => {
      subscription.remove();
    };
  }, [navigation]);
}
