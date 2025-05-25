import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChatHeader } from '~/components/ChatHeader';
import { MessageBubble, MessageBubbleProps } from '~/components/MessageBubble';
import { MessageInput } from '~/components/MessageInput';
import { useAuthStore } from '~/store/authStore';
import { useProfileStore } from '~/store/profileStore';

// Mock data - daha sonra gerçek verilerle değiştirilecek
const mockMessages: MessageBubbleProps[] = [
  {
    id: '1',
    content: 'Merhaba! Size nasıl yardımcı olabilirim?',
    timestamp: '09:00',
    isOwn: false,
    type: 'doctor',
    senderName: 'Dr. Mehmet Yılmaz',
    status: 'read',
  },
  {
    id: '2',
    content: 'Merhaba doktor, son ölçümlerimle ilgili sorularım var.',
    timestamp: '09:15',
    isOwn: true,
    type: 'user',
    status: 'read',
  },
  {
    id: '3',
    content: 'Tabii ki, hangi ölçümlerinizle ilgili soru sormak istiyorsunuz?',
    timestamp: '09:16',
    isOwn: false,
    type: 'doctor',
    senderName: 'Dr. Mehmet Yılmaz',
    status: 'read',
  },
  {
    id: '4',
    content: 'Kan şekeri değerlerim son birkaç gündür biraz yüksek çıkıyor.',
    timestamp: '09:20',
    isOwn: true,
    type: 'user',
    status: 'delivered',
  },
  {
    id: '5',
    content: 'Anlıyorum. Değerlerinizi inceleyip size öneriler sunacağım. Lütfen biraz bekleyin.',
    timestamp: '09:22',
    isOwn: false,
    type: 'doctor',
    senderName: 'Dr. Mehmet Yılmaz',
    status: 'read',
  },
  {
    id: '6',
    content: 'Hasta verileriniz analiz ediliyor...',
    timestamp: '09:23',
    isOwn: false,
    type: 'system',
    status: 'read',
  },
  {
    id: '7',
    content: 'Son 7 günlük kan şekeri ortalamanız 145 mg/dL. Normal değerler 70-140 mg/dL arasındadır. Diyetinizi gözden geçirmenizi öneriyorum.',
    timestamp: '09:25',
    isOwn: false,
    type: 'ai',
    senderName: 'DiabetesAI Asistan',
    status: 'read',
  },
];

export default function MesajlarEkrani() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile } = useProfileStore();
  const [messages, setMessages] = useState<MessageBubbleProps[]>(mockMessages);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Ekran açıldığında en son mesaja scroll yap
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const newMessage: MessageBubbleProps = {
      id: Date.now().toString(),
      content: messageText,
      timestamp: new Date().toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isOwn: true,
      type: 'user',
      status: 'sending',
    };

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    // Mesajı gönderme simülasyonu
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'sent' as const }
            : msg
        )
      );
      setIsLoading(false);
      
      // En son mesaja scroll yap
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1000);
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleInfoPress = () => {
    Alert.alert(
      'Mesajlaşma Bilgisi',
      'Bu özellik henüz geliştirme aşamasındadır. Yakında doktorunuzla güvenli mesajlaşma imkanı sunulacaktır.',
      [{ text: 'Tamam' }]
    );
  };

  const getDoctorName = () => {
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
      />
      
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={false} // Şimdilik false, daha sonra doktor ataması kontrolü eklenecek
        isLoading={isLoading}
        placeholder="Mesajınızı yazın..."
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
  },
  messagesContent: {
    paddingVertical: 16,
  },
}); 