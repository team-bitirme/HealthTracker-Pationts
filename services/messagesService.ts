import { supabase } from '~/lib/supabase';
import {
  Message,
  MessageWithDetails,
  MessageType,
  SendMessageRequest,
  GetMessagesRequest,
  MessagesResponse,
  MessageBubbleData,
} from '~/lib/types/messages';

class MessagesService {
  /**
   * Mesaj tiplerini getir
   */
  async getMessageTypes(): Promise<MessageType[]> {
    try {
      const { data, error } = await supabase.from('message_types').select('*').order('id');

      if (error) {
        console.error('Mesaj tipleri alınırken hata:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Mesaj tipleri alınırken hata:', error);
      throw error;
    }
  }

  /**
   * İki kullanıcı arasındaki mesajları getir
   */
  async getMessages(request: GetMessagesRequest): Promise<MessagesResponse> {
    try {
      const { user_id, other_user_id, limit = 50, offset = 0 } = request;

      let query = supabase
        .from('messages')
        .select(
          `
          *,
          message_types!inner(name),
          sender:users!messages_sender_user_id_fkey(email),
          receiver:users!messages_receiver_user_id_fkey(email)
        `
        )
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      // Eğer other_user_id belirtilmişse, sadece o kullanıcıyla olan mesajları getir
      if (other_user_id) {
        query = query.or(
          `and(sender_user_id.eq.${user_id},receiver_user_id.eq.${other_user_id}),and(sender_user_id.eq.${other_user_id},receiver_user_id.eq.${user_id})`
        );
      } else {
        // Kullanıcının tüm mesajlarını getir
        query = query.or(`sender_user_id.eq.${user_id},receiver_user_id.eq.${user_id}`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Mesajlar alınırken hata:', error);
        throw error;
      }

      const messages: MessageWithDetails[] = (data || []).map((msg) => ({
        ...msg,
        message_type_name: msg.message_types?.name,
        sender_email: msg.sender?.email,
        receiver_email: msg.receiver?.email,
      }));

      return {
        messages,
        total_count: count || 0,
        has_more: offset + limit < (count || 0),
      };
    } catch (error) {
      console.error('Mesajlar alınırken hata:', error);
      throw error;
    }
  }

  /**
   * Yeni mesaj gönder
   */
  async sendMessage(
    request: SendMessageRequest,
    sender_user_id: string
  ): Promise<MessageWithDetails> {
    try {
      const { receiver_user_id, message_type_id, content } = request;

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_user_id,
          receiver_user_id,
          message_type_id,
          content,
        })
        .select(
          `
          *,
          message_types!inner(name),
          sender:users!messages_sender_user_id_fkey(email),
          receiver:users!messages_receiver_user_id_fkey(email)
        `
        )
        .single();

      if (error) {
        console.error('Mesaj gönderilirken hata:', error);
        throw error;
      }

      return {
        ...data,
        message_type_name: data.message_types?.name,
        sender_email: data.sender?.email,
        receiver_email: data.receiver?.email,
      };
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      throw error;
    }
  }

  /**
   * Kullanıcının doktorunu getir
   */
  async getUserDoctor(
    user_id: string
  ): Promise<{ doctor_user_id: string; doctor_name: string } | null> {
    try {
      const { data, error } = await supabase
        .from('doctor_patients')
        .select(
          `
          doctors!inner(
            user_id,
            name,
            surname
          ),
          patients!inner(
            user_id
          )
        `
        )
        .eq('patients.user_id', user_id)
        .eq('is_deleted', false)
        .single();

      if (error || !data) {
        console.log('Doktor bilgisi bulunamadı:', error);
        return null;
      }

      return {
        doctor_user_id: data.doctors.user_id || '',
        doctor_name: `${data.doctors.name || ''} ${data.doctors.surname || ''}`.trim(),
      };
    } catch (error) {
      console.error('Doktor bilgisi alınırken hata:', error);
      return null;
    }
  }

  /**
   * Doktor ismini user_id'den al
   */
  async getDoctorNameByUserId(user_id: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('name, surname')
        .eq('user_id', user_id)
        .single();

      if (error || !data) {
        return 'Dr. Doktor';
      }

      return `Dr. ${data.name || ''} ${data.surname || ''}`.trim();
    } catch (error) {
      return 'Dr. Doktor';
    }
  }

  /**
   * Mesajları UI için uygun formata çevir
   */
  async convertToMessageBubbles(
    messages: MessageWithDetails[],
    currentUserId: string,
    doctorName?: string
  ): Promise<MessageBubbleData[]> {
    const AI_ASSISTANT_ID = '00d1201a-ca68-49f4-be4a-37ebb492a022';

    return messages.map((msg) => {
      const isOwn = msg.sender_user_id === currentUserId;
      const timestamp = msg.created_at
        ? new Date(msg.created_at).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';

      let type: 'user' | 'doctor' | 'ai' | 'system' = 'user';
      let senderName = '';

      if (!isOwn) {
        // AI asistanın gönderdiği mesajlar
        if (msg.sender_user_id === AI_ASSISTANT_ID) {
          type = 'ai';
          senderName = 'AI Asistan';
        } else {
          // Doktor mesajları
          type = 'doctor';
          senderName = doctorName || 'Dr. Doktor';
        }
      } else {
        // Kullanıcının gönderdiği mesajlar
        if (msg.receiver_user_id === AI_ASSISTANT_ID) {
          // AI'ya gönderilen mesajlar
          type = 'user';
        } else {
          // Doktora gönderilen mesajlar
          type = 'user';
        }
      }

      // Mesajın okunma durumunu belirle - hem AI hem doktor mesajları için is_read kullan
      let status: 'sent' | 'delivered' | 'read' = 'read';

      if (!isOwn) {
        // Gelen mesajlar için is_read bilgisini kullan
        status = msg.is_read ? 'read' : 'delivered';
      } else {
        // Gönderilen mesajlar her zaman gönderilmiş olarak işaretle
        status = 'sent';
      }

      return {
        id: msg.id,
        content: msg.content || '',
        timestamp,
        isOwn,
        type,
        senderName,
        status,
      };
    });
  }

  /**
   * Yeni mesaj var mı kontrol et
   */
  async checkForNewMessages(user_id: string, lastMessageId?: string): Promise<boolean> {
    try {
      if (!lastMessageId) {
        // İlk kontrol, sadece mesaj var mı yok mu kontrol et
        const { count, error } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .or(`sender_user_id.eq.${user_id},receiver_user_id.eq.${user_id}`)
          .eq('is_deleted', false);

        if (error) {
          console.error('Yeni mesaj kontrolü yapılırken hata:', error);
          return false;
        }

        return (count || 0) > 0;
      }

      // Son mesajın timestamp'ini al
      const { data: lastMessage, error: lastMessageError } = await supabase
        .from('messages')
        .select('created_at')
        .eq('id', lastMessageId)
        .single();

      if (lastMessageError || !lastMessage) {
        console.error('Son mesaj bulunamadı:', lastMessageError);
        return false;
      }

      // Son mesajdan sonraki mesajları kontrol et
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .or(`sender_user_id.eq.${user_id},receiver_user_id.eq.${user_id}`)
        .eq('is_deleted', false)
        .gt('created_at', lastMessage.created_at);

      if (error) {
        console.error('Yeni mesaj kontrolü yapılırken hata:', error);
        return false;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('Yeni mesaj kontrolü yapılırken hata:', error);
      return false;
    }
  }

  /**
   * AI mesajlarını okundu olarak işaretle
   */
  async markAiMessagesAsRead(userId: string): Promise<void> {
    const AI_ASSISTANT_ID = '00d1201a-ca68-49f4-be4a-37ebb492a022';

    try {
      // AI asistanın gönderdiği okunmamış mesajları okundu olarak işaretle
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_user_id', AI_ASSISTANT_ID)
        .eq('receiver_user_id', userId)
        .eq('is_read', false)
        .eq('is_deleted', false);

      if (error) {
        console.error('AI mesajları okundu olarak işaretlenirken hata:', error);
        throw error;
      }

      console.log('✅ AI mesajları okundu olarak işaretlendi');
    } catch (error) {
      console.error('AI mesajları okundu olarak işaretlenirken hata:', error);
      throw error;
    }
  }

  /**
   * Doktor mesajlarını okundu olarak işaretle
   */
  async markDoctorMessagesAsRead(userId: string, doctorUserId: string): Promise<void> {
    try {
      // Doktorun gönderdiği okunmamış mesajları okundu olarak işaretle
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_user_id', doctorUserId)
        .eq('receiver_user_id', userId)
        .eq('is_read', false)
        .eq('is_deleted', false);

      if (error) {
        console.error('Doktor mesajları okundu olarak işaretlenirken hata:', error);
        throw error;
      }

      console.log('✅ Doktor mesajları okundu olarak işaretlendi');
    } catch (error) {
      console.error('Doktor mesajları okundu olarak işaretlenirken hata:', error);
      throw error;
    }
  }
}

export const messagesService = new MessagesService();
