import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChatHeader } from '~/components/ChatHeader';
import { MessageBubble, MessageBubbleProps } from '~/components/MessageBubble';
import { MessageInput } from '~/components/MessageInput';
import { useAuthStore } from '~/store/authStore';
import { useProfileStore } from '~/store/profileStore';
import { useMessagesStore } from '~/store/messagesStore';
import { useMessageChecker } from '~/lib/hooks/useMessageChecker';

export default function MesajlarEkrani() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile } = useProfileStore();
  const flatListRef = useRef<FlatList>(null);

  const {
    messages,
    isLoading,
    isSending,
    error,
    doctorInfo,
    loadMessages,
    sendMessage,
    loadDoctorInfo,
    loadMessageTypes,
    clearMessages,
    setError
  } = useMessagesStore();

  // Yeni mesaj kontrolü
  useMessageChecker({
    enabled: true,
    interval: 30000, // 30 saniye
    onNewMessage: () => {
      // Yeni mesaj geldiğinde mesajları yeniden yükle
      if (user?.id && doctorInfo?.doctor_user_id) {
        loadMessages(user.id, doctorInfo.doctor_user_id);
      }
    }
  });

  useEffect(() => {
    const initializeMessages = async () => {
      if (!user?.id) return;

      try {
        // Mesaj tiplerini yükle
        await loadMessageTypes();
        
        // Doktor bilgisini yükle
        await loadDoctorInfo(user.id);
        
        // Doktor bilgisi yüklendikten sonra mesajları yükle
        // Bu useEffect doctorInfo değiştiğinde tekrar çalışacak
      } catch (error) {
        console.error('Mesaj sistemi başlatılırken hata:', error);
      }
    };

    initializeMessages();
  }, [user?.id, loadMessageTypes, loadDoctorInfo]);

  useEffect(() => {
    // Doktor bilgisi yüklendikten sonra mesajları yükle
    if (user?.id && doctorInfo?.doctor_user_id) {
      loadMessages(user.id, doctorInfo.doctor_user_id);
    }
  }, [user?.id, doctorInfo?.doctor_user_id, loadMessages]);

  useEffect(() => {
    // Mesajlar güncellendiğinde en sona scroll yap
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  useEffect(() => {
    // Ekran kapanırken mesajları temizle
    return () => {
      clearMessages();
    };
  }, [clearMessages]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || !user?.id || !doctorInfo?.doctor_user_id) {
      return;
    }

    try {
      await sendMessage(messageText, user.id, doctorInfo.doctor_user_id, 1); // 1 = genel mesaj tipi
      
      // Mesaj gönderildikten sonra en sona scroll yap
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert(
        'Hata',
        'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleInfoPress = () => {
    if (doctorInfo) {
      Alert.alert(
        'Doktor Bilgisi',
        `${doctorInfo.doctor_name} ile mesajlaşıyorsunuz.`,
        [{ text: 'Tamam' }]
      );
    } else {
      Alert.alert(
        'Bilgi',
        'Henüz bir doktorunuz atanmamış. Lütfen yöneticinizle iletişime geçin.',
        [{ text: 'Tamam' }]
      );
    }
  };

  const getDoctorName = () => {
    if (doctorInfo?.doctor_name) {
      return doctorInfo.doctor_name;
    }
    if (profile?.doctor_name && profile?.doctor_surname) {
      return `Dr. ${profile.doctor_name} ${profile.doctor_surname}`;
    }
    return 'Doktorunuz';
  };

  const getDoctorSubtitle = () => {
    if (profile?.doctor_specialization) {
      return profile.doctor_specialization;
    }
    return 'Çevrimiçi';
  };

  const renderMessage = ({ item }: { item: MessageBubbleProps }) => (
    <MessageBubble {...item} />
  );

  const getItemLayout = (_: any, index: number) => ({
    length: 80, // Ortalama mesaj yüksekliği
    offset: 80 * index,
    index,
  });

  // Error handling
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Hata',
        error,
        [
          { 
            text: 'Tamam', 
            onPress: () => setError(null) 
          }
        ]
      );
    }
  }, [error, setError]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ChatHeader
        title={getDoctorName()}
        subtitle={getDoctorSubtitle()}
        onBackPress={handleBackPress}
        onInfoPress={handleInfoPress}
      />
      
      <FlatList
        ref={flatListRef}
        data={messages}
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
          if (user?.id && doctorInfo?.doctor_user_id) {
            loadMessages(user.id, doctorInfo.doctor_user_id);
          }
        }}
      />
      
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={!doctorInfo?.doctor_user_id || isSending}
        isLoading={isSending}
        placeholder={
          doctorInfo?.doctor_user_id 
            ? "Mesajınızı yazın..." 
            : "Doktor ataması bekleniyor..."
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
}); 