import { create } from 'zustand';
import { MessageBubbleData, MessageWithDetails, MessageType } from '~/lib/types/messages';
import { messagesService } from '~/services/messagesService';

// AI Asistan için statik ID
const AI_ASSISTANT_ID = '00d1201a-ca68-49f4-be4a-37ebb492a022';

interface DashboardMessageInfo {
  latestMessage?: MessageBubbleData;
  unreadCount: number;
  lastUnreadMessage?: MessageBubbleData;
}

interface MessagesState {
  // State
  messages: MessageBubbleData[];
  doctorMessages: MessageBubbleData[];
  aiMessages: MessageBubbleData[];
  messageTypes: MessageType[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  lastMessageId: string | null;
  lastDoctorMessageId: string | null;
  lastAiMessageId: string | null;
  doctorInfo: { doctor_user_id: string; doctor_name: string } | null;

  // Dashboard info
  dashboardDoctorInfo: DashboardMessageInfo;
  dashboardAiInfo: DashboardMessageInfo;

  // Message checking interval
  checkInterval: number | null;

  // Actions
  loadMessages: (userId: string, doctorUserId?: string) => Promise<void>;
  loadDoctorMessages: (userId: string) => Promise<void>;
  loadAiMessages: (userId: string) => Promise<void>;
  sendMessage: (
    content: string,
    senderUserId: string,
    receiverUserId: string,
    messageTypeId?: number,
    isAiMessage?: boolean
  ) => Promise<void>;
  loadMessageTypes: () => Promise<void>;
  loadDoctorInfo: (userId: string) => Promise<void>;
  checkForNewMessages: (userId: string) => Promise<boolean>;
  checkForNewDoctorMessages: (userId: string) => Promise<boolean>;
  checkForNewAiMessages: (userId: string) => Promise<boolean>;
  updateDashboardInfo: (userId: string) => Promise<void>;
  markAiMessagesAsRead: (userId: string) => Promise<void>;
  markDoctorMessagesAsRead: (userId: string) => Promise<void>;
  startMessageChecking: (userId: string) => void;
  stopMessageChecking: () => void;
  clearMessages: () => void;
  setError: (error: string | null) => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  // Initial state
  messages: [],
  doctorMessages: [],
  aiMessages: [],
  messageTypes: [],
  isLoading: false,
  isSending: false,
  error: null,
  lastMessageId: null,
  lastDoctorMessageId: null,
  lastAiMessageId: null,
  doctorInfo: null,
  dashboardDoctorInfo: { unreadCount: 0 },
  dashboardAiInfo: { unreadCount: 0 },
  checkInterval: null,

  // Actions
  loadMessages: async (userId: string, doctorUserId?: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await messagesService.getMessages({
        user_id: userId,
        other_user_id: doctorUserId,
        limit: 100,
      });

      const messageBubbles = await messagesService.convertToMessageBubbles(
        response.messages,
        userId,
        get().doctorInfo?.doctor_name
      );

      const lastMessage = response.messages[response.messages.length - 1];

      set({
        messages: messageBubbles,
        lastMessageId: lastMessage?.id || null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
      set({
        error: error instanceof Error ? error.message : 'Mesajlar yüklenemedi',
        isLoading: false,
      });
    }
  },

  loadDoctorMessages: async (userId: string) => {
    try {
      const { doctorInfo } = get();
      if (!doctorInfo) return;

      const response = await messagesService.getMessages({
        user_id: userId,
        other_user_id: doctorInfo.doctor_user_id,
        limit: 100,
      });

      const messageBubbles = await messagesService.convertToMessageBubbles(
        response.messages,
        userId,
        doctorInfo.doctor_name
      );

      // Sadece doktor mesajlarını filtrele (AI mesajları değil)
      const doctorOnlyMessages = messageBubbles.filter(
        (msg) => msg.type === 'doctor' || (msg.type === 'user' && msg.isOwn)
      );

      const lastMessage = response.messages[response.messages.length - 1];

      set({
        doctorMessages: doctorOnlyMessages,
        lastDoctorMessageId: lastMessage?.id || null,
      });
    } catch (error) {
      console.error('Doktor mesajları yüklenirken hata:', error);
    }
  },

  loadAiMessages: async (userId: string) => {
    try {
      // AI mesajları için statik AI ID ile filtreleme
      const response = await messagesService.getMessages({
        user_id: userId,
        other_user_id: AI_ASSISTANT_ID,
        limit: 100,
      });

      const messageBubbles = await messagesService.convertToMessageBubbles(
        response.messages,
        userId,
        'AI Asistan'
      );

      // AI mesajlarını filtrele
      const aiOnlyMessages = messageBubbles.filter(
        (msg) =>
          msg.type === 'ai' ||
          (msg.type === 'user' && msg.isOwn) ||
          isAiMessageByIds(
            response.messages.find((m) => m.id === msg.id),
            userId
          )
      );

      const lastAiMessage = response.messages.filter((msg) => isAiMessageByIds(msg, userId)).pop();

      set({
        aiMessages: aiOnlyMessages,
        lastAiMessageId: lastAiMessage?.id || null,
      });
    } catch (error) {
      console.error('AI mesajları yüklenirken hata:', error);
    }
  },

  sendMessage: async (
    content: string,
    senderUserId: string,
    receiverUserId: string,
    messageTypeId = 1,
    isAiMessage = false
  ) => {
    try {
      set({ isSending: true, error: null });

      // AI mesajı ise receiver ID'yi AI statik ID olarak ayarla
      const finalReceiverId = isAiMessage ? AI_ASSISTANT_ID : receiverUserId;

      // Optimistic update - mesajı hemen UI'a ekle
      const tempMessage: MessageBubbleData = {
        id: `temp-${Date.now()}`,
        content,
        timestamp: new Date().toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isOwn: true,
        type: 'user',
        status: 'sending',
      };

      // Mesajı ilgili listeye ekle
      if (isAiMessage) {
        set((state) => ({
          aiMessages: [...state.aiMessages, tempMessage],
        }));
      } else {
        set((state) => ({
          doctorMessages: [...state.doctorMessages, tempMessage],
          messages: [...state.messages, tempMessage],
        }));
      }

      // Gerçek mesajı gönder
      const sentMessage = await messagesService.sendMessage(
        {
          receiver_user_id: finalReceiverId,
          message_type_id: messageTypeId,
          content,
        },
        senderUserId
      );

      // Temp mesajı gerçek mesajla değiştir
      const realMessageBubbles = await messagesService.convertToMessageBubbles(
        [sentMessage],
        senderUserId,
        isAiMessage ? 'AI Asistan' : get().doctorInfo?.doctor_name
      );
      const realMessageBubble = realMessageBubbles[0];

      if (isAiMessage) {
        set((state) => ({
          aiMessages: state.aiMessages.map((msg) =>
            msg.id === tempMessage.id ? { ...realMessageBubble, status: 'sent' as const } : msg
          ),
          lastAiMessageId: sentMessage.id,
          isSending: false,
        }));
      } else {
        set((state) => ({
          doctorMessages: state.doctorMessages.map((msg) =>
            msg.id === tempMessage.id ? { ...realMessageBubble, status: 'sent' as const } : msg
          ),
          messages: state.messages.map((msg) =>
            msg.id === tempMessage.id ? { ...realMessageBubble, status: 'sent' as const } : msg
          ),
          lastDoctorMessageId: sentMessage.id,
          lastMessageId: sentMessage.id,
          isSending: false,
        }));
      }

      // Mesaj gönderildikten sonra dashboard bilgilerini güncelle
      get().updateDashboardInfo(senderUserId);
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);

      // Hata durumunda temp mesajı kaldır
      set((state) => ({
        messages: state.messages.filter((msg) => !msg.id.startsWith('temp-')),
        doctorMessages: state.doctorMessages.filter((msg) => !msg.id.startsWith('temp-')),
        aiMessages: state.aiMessages.filter((msg) => !msg.id.startsWith('temp-')),
        error: error instanceof Error ? error.message : 'Mesaj gönderilemedi',
        isSending: false,
      }));
    }
  },

  loadMessageTypes: async () => {
    try {
      const types = await messagesService.getMessageTypes();
      set({ messageTypes: types });
    } catch (error) {
      console.error('Mesaj tipleri yüklenirken hata:', error);
      set({ error: error instanceof Error ? error.message : 'Mesaj tipleri yüklenemedi' });
    }
  },

  loadDoctorInfo: async (userId: string) => {
    try {
      const doctorInfo = await messagesService.getUserDoctor(userId);
      set({ doctorInfo });
    } catch (error) {
      console.error('Doktor bilgisi yüklenirken hata:', error);
    }
  },

  checkForNewMessages: async (userId: string) => {
    try {
      const { lastMessageId } = get();
      const hasNewMessages = await messagesService.checkForNewMessages(
        userId,
        lastMessageId || undefined
      );
      return hasNewMessages;
    } catch (error) {
      console.error('Yeni mesaj kontrolü yapılırken hata:', error);
      return false;
    }
  },

  checkForNewDoctorMessages: async (userId: string) => {
    try {
      const { lastDoctorMessageId } = get();
      const hasNewMessages = await messagesService.checkForNewMessages(
        userId,
        lastDoctorMessageId || undefined
      );
      return hasNewMessages;
    } catch (error) {
      console.error('Yeni doktor mesajı kontrolü yapılırken hata:', error);
      return false;
    }
  },

  checkForNewAiMessages: async (userId: string) => {
    try {
      const { lastAiMessageId } = get();
      const hasNewMessages = await messagesService.checkForNewMessages(
        userId,
        lastAiMessageId || undefined
      );
      return hasNewMessages;
    } catch (error) {
      console.error('Yeni AI mesajı kontrolü yapılırken hata:', error);
      return false;
    }
  },

  updateDashboardInfo: async (userId: string) => {
    try {
      console.log('🔄 Dashboard bilgileri güncelleniyor...', userId);

      // Doktor mesajları için dashboard bilgisi - is_read bilgisini kullan
      await get().loadDoctorMessages(userId);
      const { doctorMessages } = get();

      console.log('📧 Doktor mesajları yüklendi:', doctorMessages.length);

      // Doktor mesajlarında okunmamış olanları bul (gelen mesajlarda is_read = false olanlar)
      const unreadDoctorMessages = doctorMessages.filter(
        (msg) => !msg.isOwn && msg.status !== 'read'
      );

      // En son mesajı bul (kendi gönderdiğimiz veya doktordan gelen)
      const latestDoctorMessage =
        doctorMessages.length > 0 ? doctorMessages[doctorMessages.length - 1] : undefined;

      const dashboardDoctorInfo: DashboardMessageInfo = {
        latestMessage: latestDoctorMessage,
        unreadCount: unreadDoctorMessages.length,
        lastUnreadMessage:
          unreadDoctorMessages.length > 0
            ? unreadDoctorMessages[unreadDoctorMessages.length - 1]
            : undefined,
      };

      // AI mesajları için dashboard bilgisi - is_read bilgisini kullan
      await get().loadAiMessages(userId);
      const { aiMessages } = get();

      console.log('🤖 AI mesajları yüklendi:', aiMessages.length);

      // AI mesajlarında okunmamış olanları bul (gelen mesajlarda is_read = false olanlar)
      const unreadAiMessages = aiMessages.filter((msg) => !msg.isOwn && msg.status !== 'read');

      // En son AI mesajını bul
      const latestAiMessage = aiMessages.length > 0 ? aiMessages[aiMessages.length - 1] : undefined;

      const dashboardAiInfo: DashboardMessageInfo = {
        latestMessage: latestAiMessage,
        unreadCount: unreadAiMessages.length,
        lastUnreadMessage:
          unreadAiMessages.length > 0 ? unreadAiMessages[unreadAiMessages.length - 1] : undefined,
      };

      console.log('📊 Dashboard güncellendi:', {
        doctorLatest: !!latestDoctorMessage,
        doctorUnread: unreadDoctorMessages.length,
        aiLatest: !!latestAiMessage,
        aiUnread: unreadAiMessages.length,
      });

      set({ dashboardDoctorInfo, dashboardAiInfo });
    } catch (error) {
      console.error('Dashboard bilgileri güncellenirken hata:', error);
    }
  },

  markAiMessagesAsRead: async (userId: string) => {
    try {
      // Database'de AI mesajlarını okundu olarak işaretle
      await messagesService.markAiMessagesAsRead(userId);

      // Local state'i güncelle
      await get().loadAiMessages(userId);

      // Dashboard bilgilerini güncelle
      await get().updateDashboardInfo(userId);
    } catch (error) {
      console.error('AI mesajları okundu olarak işaretlenirken hata:', error);
    }
  },

  markDoctorMessagesAsRead: async (userId: string) => {
    try {
      const { doctorInfo } = get();
      if (!doctorInfo?.doctor_user_id) {
        console.warn('Doktor bilgisi bulunamadı, mesajlar okundu olarak işaretlenemedi');
        return;
      }

      // Database'de doktor mesajlarını okundu olarak işaretle
      await messagesService.markDoctorMessagesAsRead(userId, doctorInfo.doctor_user_id);

      // Local state'i güncelle
      await get().loadDoctorMessages(userId);

      // Dashboard bilgilerini güncelle
      await get().updateDashboardInfo(userId);
    } catch (error) {
      console.error('Doktor mesajları okundu olarak işaretlenirken hata:', error);
    }
  },

  startMessageChecking: (userId: string) => {
    // Önce mevcut interval'ı temizle
    const { checkInterval } = get();
    if (checkInterval) {
      clearInterval(checkInterval);
      console.log('🛑 Eski mesaj kontrolü durduruldu');
    }

    console.log('🚀 Yeni mesaj kontrolü başlatılıyor...', userId);

    // Yeni interval başlat (10 saniyede bir)
    const newInterval = setInterval(async () => {
      try {
        console.log('🔍 Mesaj kontrolü yapılıyor...', new Date().toLocaleTimeString());

        const hasNewDoctorMessages = await get().checkForNewDoctorMessages(userId);
        const hasNewAiMessages = await get().checkForNewAiMessages(userId);

        if (hasNewDoctorMessages || hasNewAiMessages) {
          console.log('🔔 Yeni mesajlar tespit edildi, dashboard güncelleniyor...');
          await get().updateDashboardInfo(userId);
        } else {
          console.log('✅ Yeni mesaj yok');
        }
      } catch (error) {
        console.error('❌ Mesaj kontrolü hatası:', error);
      }
    }, 10000); // 10 saniye

    set({ checkInterval: newInterval });
    console.log('📱 Mesaj kontrolü başlatıldı (10 saniyede bir)');
  },

  stopMessageChecking: () => {
    const { checkInterval } = get();
    if (checkInterval) {
      clearInterval(checkInterval);
      set({ checkInterval: null });
      console.log('📱 Mesaj kontrolü durduruldu');
    }
  },

  clearMessages: () => {
    // Sadece sohbet verilerini temizle, dashboard verileri ve global mesaj kontrolü korunur
    set({
      messages: [],
      doctorMessages: [],
      aiMessages: [],
      lastMessageId: null,
      lastDoctorMessageId: null,
      lastAiMessageId: null,
      error: null,
      // doctorInfo, dashboardDoctorInfo ve dashboardAiInfo korunur
      // checkInterval korunur (global mesaj kontrolü devam eder)
    });
    console.log('🧹 Chat mesajları temizlendi, dashboard verileri korundu');
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

// Yardımcı fonksiyonlar
function isAiMessageByIds(message: MessageWithDetails | undefined, userId: string): boolean {
  if (!message) return false;

  // AI asistanın gönderdiği mesajlar: sender_id = AI_ASSISTANT_ID
  // Kullanıcının AI'ya gönderdiği mesajlar: sender_id = userId, receiver_id = AI_ASSISTANT_ID
  return (
    message.sender_user_id === AI_ASSISTANT_ID ||
    (message.sender_user_id === userId && message.receiver_user_id === AI_ASSISTANT_ID)
  );
}

function isAiMessage(message: MessageWithDetails, userId: string): boolean {
  // Eski AI mesajı kontrolü - geriye dönük uyumluluk için
  return (
    message.message_type_name?.toLowerCase().includes('değerlendirme') ||
    message.message_type_name?.toLowerCase().includes('ai') ||
    isAiMessageByIds(message, userId)
  );
}

function isAiConversation(messages: MessageWithDetails[], messageId: string): boolean {
  // Bu mesajın AI konuşmasının bir parçası olup olmadığını kontrol et
  const messageIndex = messages.findIndex((msg) => msg.id === messageId);
  if (messageIndex === -1) return false;

  // Önceki ve sonraki mesajlara bakarak AI konuşması olup olmadığını anla
  const prevMessage = messages[messageIndex - 1];
  const nextMessage = messages[messageIndex + 1];

  return (
    (prevMessage && isAiMessage(prevMessage, '')) || (nextMessage && isAiMessage(nextMessage, ''))
  );
}
