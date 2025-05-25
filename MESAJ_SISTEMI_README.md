# Mesaj Sistemi Dokümantasyonu

## Genel Bakış

Bu proje için işlevsel bir mesaj sistemi oluşturulmuştur. Sistem, hasta ve doktor arasında güvenli mesajlaşma imkanı sağlar ve Supabase veritabanını kullanır.

## Özellikler

- ✅ Hasta-Doktor mesajlaşması
- ✅ Mesaj tipleri (Genel, AI Değerlendirme, Geri Bildirim)
- ✅ Gerçek zamanlı olmayan mesaj kontrolü (30 saniye aralıklarla)
- ✅ Optimistic UI güncellemeleri
- ✅ Hata yönetimi
- ✅ Mesaj durumu takibi (gönderiliyor, gönderildi, okundu)

## Dosya Yapısı

### Tip Tanımları
- `lib/types/messages.ts` - Mesaj ile ilgili tüm tip tanımları

### Servisler
- `services/messagesService.ts` - Supabase ile mesaj işlemleri

### State Yönetimi
- `store/messagesStore.ts` - Zustand ile mesaj state yönetimi

### Hook'lar
- `lib/hooks/useMessageChecker.ts` - Periyodik mesaj kontrolü

### Ekranlar
- `app/mesajlar.tsx` - Ana mesajlaşma ekranı
- `app/(tabs)/index.tsx` - Ana sayfa (mesaj bildirimleri ile)

## Veritabanı Yapısı

### Tablolar

1. **messages**
   - `id` (UUID, Primary Key)
   - `sender_user_id` (UUID, Foreign Key)
   - `receiver_user_id` (UUID, Foreign Key)
   - `message_type_id` (Integer, Foreign Key)
   - `content` (Text)
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)
   - `is_deleted` (Boolean)

2. **message_types**
   - `id` (Integer, Primary Key)
   - `code` (Text, Unique)
   - `name` (Text)

3. **doctor_patients**
   - Doktor-hasta ilişkilerini yönetir

## Kullanım

### Mesaj Gönderme

```typescript
const { sendMessage } = useMessagesStore();

await sendMessage(
  "Mesaj içeriği",
  senderUserId,
  receiverUserId,
  messageTypeId
);
```

### Mesajları Yükleme

```typescript
const { loadMessages } = useMessagesStore();

await loadMessages(userId, doctorUserId);
```

### Yeni Mesaj Kontrolü

```typescript
import { useMessageChecker } from '~/lib/hooks/useMessageChecker';

useMessageChecker({
  enabled: true,
  interval: 30000, // 30 saniye
  onNewMessage: () => {
    console.log('Yeni mesaj geldi!');
  }
});
```

## Test Verileri

Sistem test edilebilmesi için örnek mesajlar eklenmiştir:

- **Kullanıcılar:**
  - Hasta: test@example.com (ID: 08a01af4-da3c-4ae9-8fe0-c6f0d5487f10)
  - Doktor: ayse@example.com (ID: 5354c88e-69fc-43f0-abcf-1a4c9fc30b0b)

- **Mesaj Tipleri:**
  1. Genel (code: general)
  2. Genel Değerlendirme (code: summary)
  3. Geri Bildirim (code: feedback)

## Önemli Notlar

1. **Gerçek Zamanlı Özellik Yok**: Sistem şu anda gerçek zamanlı mesajlaşma desteklemiyor. Mesajlar 30 saniye aralıklarla kontrol ediliyor.

2. **Doktor Ataması**: Hasta bir doktora atanmış olmalı ki mesajlaşma çalışsın.

3. **Optimistic Updates**: Mesaj gönderilirken UI hemen güncellenir, hata durumunda geri alınır.

4. **Hata Yönetimi**: Tüm hata durumları kullanıcıya uygun şekilde gösterilir.

## Gelecek Geliştirmeler

- [ ] Gerçek zamanlı mesajlaşma (WebSocket/Supabase Realtime)
- [ ] Mesaj okundu bilgisi
- [ ] Dosya/resim gönderme
- [ ] Mesaj arama
- [ ] Mesaj silme/düzenleme
- [ ] Push notification entegrasyonu

## Kurulum ve Çalıştırma

1. Supabase bağlantısı zaten yapılandırılmış
2. Gerekli tablolar ve test verileri eklenmiş
3. Uygulamayı çalıştırın: `npm start`
4. test@example.com ile giriş yapın
5. Mesajlar ekranına gidin ve mesajlaşmayı test edin

## Sorun Giderme

### Mesajlar Görünmüyor
- Kullanıcının doktora atanmış olduğundan emin olun
- Supabase bağlantısını kontrol edin
- Console loglarını inceleyin

### Mesaj Gönderilmiyor
- İnternet bağlantısını kontrol edin
- Doktor bilgisinin yüklendiğinden emin olun
- Hata mesajlarını inceleyin

### Yeni Mesaj Bildirimi Çalışmıyor
- useMessageChecker hook'unun doğru kullanıldığından emin olun
- Interval süresini kontrol edin
- User ID'nin mevcut olduğundan emin olun 