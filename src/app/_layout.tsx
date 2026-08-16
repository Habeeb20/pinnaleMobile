// // src/app/_layout.tsx
// import "../../global.css";
// import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
// import * as SplashScreen from 'expo-splash-screen';
// import { useColorScheme } from 'react-native';
// import { useEffect } from 'react';

// import { AnimatedSplashOverlay } from '@/components/animated-icon';
// import { AuthProvider, useAuth } from '@/lib/auth-context';

// SplashScreen.preventAutoHideAsync();

// function RootNavigator() {
//   const { token } = useAuth();

//   useEffect(() => {
//     if (token !== undefined) {
//       SplashScreen.hideAsync();
//     }
//   }, [token]);

//   if (token === undefined) {
//     return <AnimatedSplashOverlay />;
//   }

//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Protected guard={!!token}>
//         <Stack.Screen name="(tabs)" />
//       </Stack.Protected>
//       <Stack.Protected guard={!token}>
//         <Stack.Screen name="(auth)" />
//       </Stack.Protected>
//     </Stack>
//   );
// }

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   return (
//     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//       <AuthProvider>
//         <RootNavigator />
        
//       </AuthProvider>
//     </ThemeProvider>
//   );
// }




// src/app/_layout.tsx
import "../../global.css";
import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import PinnacleAIChat from "./PinnacleAIchat";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { token } = useAuth();

  useEffect(() => {
    if (token !== undefined) {
      SplashScreen.hideAsync();
    }
  }, [token]);

  if (token === undefined) {
    return <AnimatedSplashOverlay />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!!token}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Protected guard={!token}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>

      {/* Only mount the chat widget once the user is actually authenticated */}
      {token && <PinnacleAIChat />}
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}