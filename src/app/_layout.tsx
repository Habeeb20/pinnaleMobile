// src/app/_layout.tsx
import "../../global.css";
import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    SecureStore.getItemAsync('token')
      .then((t) => setToken(t))
      .catch((err) => {
        console.log('SecureStore error:', err);
        setToken(null);
      })
      .finally(() => {
        SplashScreen.hideAsync();
      });
  }, []);

  if (token === undefined) {
    return <AnimatedSplashOverlay />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!!token}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Protected guard={!token}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}