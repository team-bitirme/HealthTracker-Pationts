import { MessageWithStatus } from '~/store/messagesStore';

export interface SendMessageRequest {
  content: string;
  recipientId: string;
  type: 'doctor' | 'ai' | 'system';
}

export interface GetMessagesRequest {
  patientId: string;
  limit?: number;
  offset?: number;
}

class MessagesService {
  private baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  async getMessages(request: GetMessagesRequest): Promise<MessageWithStatus[]> {
    try {
      const { patientId, limit = 50, offset = 0 } = request;
      
      // Şimdilik mock data döndürüyoruz
      // Gerçek API entegrasyonu daha sonra yapılacak
      return [];
      
      /* Gerçek API çağrısı:
      const response = await fetch(
        `${this.baseUrl}/api/messages?patientId=${patientId}&limit=${limit}&offset=${offset}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Authorization header eklenecek
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.messages;
      */
    } catch (error) {
      console.error('Mesajlar alınırken hata:', error);
      throw error;
    }
  }

  async sendMessage(request: SendMessageRequest): Promise<MessageWithStatus> {
    try {
      // Şimdilik mock response döndürüyoruz
      const mockMessage: MessageWithStatus = {
        id: Date.now().toString(),
        content: request.content,
        sender: 'Hasta', // Gerçek kullanıcı adı gelecek
        timestamp: new Date().toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        isUnread: false,
        type: 'doctor',
        status: 'sent',
        isOwn: true,
      };

      return mockMessage;

      /* Gerçek API çağrısı:
      const response = await fetch(`${this.baseUrl}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization header eklenecek
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.message;
      */
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      throw error;
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      // Şimdilik mock işlem
      console.log('Mesaj okundu olarak işaretlendi:', messageId);
      
      /* Gerçek API çağrısı:
      const response = await fetch(`${this.baseUrl}/api/messages/${messageId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Authorization header eklenecek
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      */
    } catch (error) {
      console.error('Mesaj okundu işaretlenirken hata:', error);
      throw error;
    }
  }

  async getUnreadCount(patientId: string): Promise<number> {
    try {
      // Şimdilik mock data
      return 0;
      
      /* Gerçek API çağrısı:
      const response = await fetch(
        `${this.baseUrl}/api/messages/unread-count?patientId=${patientId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Authorization header eklenecek
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.count;
      */
    } catch (error) {
      console.error('Okunmamış mesaj sayısı alınırken hata:', error);
      throw error;
    }
  }
}

export const messagesService = new MessagesService(); 