import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize authentication state on app start
    initialize();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="veri-ekleme-yontemi" options={{ headerShown: false }} />
      <Stack.Screen name="el-ile-giris" options={{ headerShown: false }} />
      <Stack.Screen name="fotograf-ile-giris" options={{ headerShown: false }} />
      <Stack.Screen name="olcum-gecmisi" options={{ headerShown: false }} />
      <Stack.Screen name="olcum-detay" options={{ headerShown: false }} />
    </Stack>
  );
}
