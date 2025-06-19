import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useMessagesStore } from '../store/messagesStore';
import { firebaseService } from '../lib/firebase';

export default function RootLayout() {
  const { initialize, user } = useAuthStore();
  const { startMessageChecking, stopMessageChecking, loadDoctorInfo, updateDashboardInfo } =
    useMessagesStore();

  useEffect(() => {
    // Initialize Firebase and authentication state on app start
    const initializeApp = async () => {
      try {
        console.log('🚀 Uygulama başlatılıyor...');

        // Firebase'i başlat
        await firebaseService.initialize();

        // Firebase mesaj dinleyicilerini ayarla
        const unsubscribeForeground = firebaseService.setupForegroundMessageListener();
        const unsubscribeNotificationOpened = firebaseService.setupNotificationOpenedListener();

        // Auth durumunu başlat
        await initialize();

        console.log('✅ Uygulama başarıyla başlatıldı');

        // Cleanup function
        return () => {
          unsubscribeForeground();
          unsubscribeNotificationOpened();
        };
      } catch (error) {
        console.error('❌ Uygulama başlatma hatası:', error);
      }
    };

    initializeApp();
  }, []);

  // Global mesaj kontrolü - kullanıcı giriş yaptığında başlat
  useEffect(() => {
    const initializeGlobalMessaging = async () => {
      if (!user?.id) return;

      try {
        console.log('💬 Global mesaj sistemi başlatılıyor...');

        // Doktor bilgilerini yükle
        await loadDoctorInfo(user.id);

        // Dashboard bilgilerini güncelle
        await updateDashboardInfo(user.id);

        // Mesaj kontrolünü başlat (10 saniyede bir) - Global olarak çalışacak
        startMessageChecking(user.id);

        console.log('✅ Global mesaj sistemi hazır');
      } catch (error) {
        console.error('❌ Global mesaj sistemi başlatılamadı:', error);
      }
    };

    if (user?.id) {
      initializeGlobalMessaging();
    } else {
      // Kullanıcı çıkış yaparsa mesaj kontrolünü durdur
      stopMessageChecking();
    }

    // Cleanup: kullanıcı değiştiğinde veya component unmount olduğunda
    return () => {
      // Kullanıcı değişikliği durumunda eski kullanıcının mesaj kontrolünü durdur
      if (!user?.id) {
        stopMessageChecking();
      }
    };
  }, [user?.id, loadDoctorInfo, updateDashboardInfo, startMessageChecking, stopMessageChecking]);

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
      <Stack.Screen name="mesajlar" options={{ headerShown: false }} />
      <Stack.Screen name="ai-asistan" options={{ headerShown: false }} />
      <Stack.Screen name="yeni-sikayet" options={{ headerShown: false }} />
      <Stack.Screen name="sikayet-duzenle" options={{ headerShown: false }} />
    </Stack>
  );
}
