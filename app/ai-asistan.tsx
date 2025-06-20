import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChatHeader } from '~/components/ChatHeader';
import { MessageBubble, MessageBubbleProps } from '~/components/MessageBubble';
import { MessageInput } from '~/components/MessageInput';
import { useAuthStore } from '~/store/authStore';
import { useProfileStore } from '~/store/profileStore';
import { useMessagesStore } from '~/store/messagesStore';
import { useAIStore } from '~/store/aiStore';

export default function AiAsistanEkrani() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile } = useProfileStore();
  const { setApiKey } = useAIStore();
  const flatListRef = useRef<FlatList>(null);

  const {
    aiMessages,
    isLoading,
    isSending,
    error,
    loadAiMessages,
    sendAiMessage,
    loadMessageTypes,
    updateDashboardInfo,
    markAiMessagesAsRead,
    setError,
  } = useMessagesStore();

  // Gemini API anahtarını ayarla
  useEffect(() => {
    // Gemini API anahtarını environment variable'dan al
    const apiKey =
      process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyBg4_9r4u63UBADOgclmtsTyJlPLAG4z7s';
    setApiKey(apiKey);
  }, [setApiKey]);

  // Mesaj kontrolü artık global olarak _layout.tsx'te yapılıyor
  useEffect(() => {
    const initializeAiChat = async () => {
      if (!user?.id) return;

      try {
        // Mesaj tiplerini yükle
        await loadMessageTypes();

        // AI mesajlarını yükle
        await loadAiMessages(user.id);

        // AI mesajlarını okundu olarak işaretle
        await markAiMessagesAsRead(user.id);

        // Dashboard bilgilerini güncelle
        await updateDashboardInfo(user.id);
      } catch (error) {
        console.error('AI chat sistemi başlatılırken hata:', error);
      }
    };

    initializeAiChat();
  }, [user?.id, loadMessageTypes, loadAiMessages, markAiMessagesAsRead, updateDashboardInfo]);

  useEffect(() => {
    // AI mesajları güncellendiğinde en sona scroll yap
    if (aiMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [aiMessages.length]);

  useEffect(() => {
    // Cleanup: Ekran kapanırken dashboard verilerini koru
    return () => {
      console.log('🚪 AI asistan ekranı kapanıyor, dashboard verileri korunuyor');
    };
  }, []);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || !user?.id || !profile?.patient_id) {
      return;
    }

    try {
      // AI asistan mesajı gönder ve Gemini entegrasyonu ile yanıt al
      await sendAiMessage(messageText, user.id, profile.patient_id);

      // Mesaj gönderildikten sonra en sona scroll yap
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert('Hata', 'AI asistan mesajı gönderilemedi. Lütfen tekrar deneyin.', [
        { text: 'Tamam' },
      ]);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleInfoPress = () => {
    Alert.alert(
      'AI Asistan Hakkında',
      'AI Asistan size sağlık verileriniz hakkında genel bilgi ve öneriler verebilir. Acil durumlar için mutlaka doktorunuza başvurun.',
      [{ text: 'Tamam' }]
    );
  };

  const renderMessage = ({ item }: { item: MessageBubbleProps }) => <MessageBubble {...item} />;

  const getItemLayout = (_: any, index: number) => ({
    length: 80, // Ortalama mesaj yüksekliği
    offset: 80 * index,
    index,
  });

  // Error handling
  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error, [
        {
          text: 'Tamam',
          onPress: () => setError(null),
        },
      ]);
    }
  }, [error, setError]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <ChatHeader
        title="AI Asistan"
        subtitle="7/24 Çevrimiçi"
        onBackPress={handleBackPress}
        onInfoPress={handleInfoPress}
      />

      <FlatList
        ref={flatListRef}
        data={aiMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        getItemLayout={getItemLayout}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={10}
        refreshing={isLoading}
        onRefresh={() => {
          if (user?.id) {
            loadAiMessages(user.id);
          }
        }}
      />

      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={isSending}
        isLoading={isSending}
        placeholder="AI Asistan'a mesajınızı yazın..."
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
});
