# 📱 Mesaj Sistemi Entegrasyonu

Bu dosya, HealthTracker-Patients uygulamasında geliştirilen yeni mesaj sistemini detaylandırır.

## 🎯 Sistem Özellikleri

### ✅ Gerçek Zamanlı Olmayan Mesaj Kontrolü

- Socket/WebSocket kullanılmıyor
- Belirli zaman aralıklarında manuel kontrol yapılıyor
- 10 saniyede bir otomatik kontrol

### ✅ İkili Mesajlaşma Sistemi

- **Doktor Mesajları**: Hasta ↔ Doktor
- **AI Asistan Mesajları**: Hasta ↔ AI

### ✅ Akıllı Ana Sayfa Davranışı

- Okunmamış mesaj varsa: Son okunmamış mesaj gösterilir
- Okunmamış mesaj yoksa: En güncel mesaj gösterilir
- Her chat türü için ayrı sayaçlar

## 🏗️ Teknik Yapı

### Store Güncellemeleri (`store/messagesStore.ts`)

#### Yeni State Alanları:

```typescript
interface MessagesState {
  doctorMessages: MessageBubbleData[]; // Doktor mesajları
  aiMessages: MessageBubbleData[]; // AI asistan mesajları
  lastDoctorMessageId: string | null; // Son doktor mesajı ID
  lastAiMessageId: string | null; // Son AI mesajı ID
  dashboardDoctorInfo: DashboardMessageInfo; // Ana sayfa doktor bilgileri
  dashboardAiInfo: DashboardMessageInfo; // Ana sayfa AI bilgileri
  checkInterval: number | null; // Kontrol interval'ı
}
```

#### Yeni Fonksiyonlar:

- `loadDoctorMessages()` - Sadece doktor mesajlarını yükler
- `loadAiMessages()` - Sadece AI mesajlarını yükler
- `updateDashboardInfo()` - Ana sayfa bilgilerini günceller
- `startMessageChecking()` - 10 saniyelik interval başlatır
- `stopMessageChecking()` - Interval'ı durdurur
- `checkForNewDoctorMessages()` - Yeni doktor mesajı kontrolü
- `checkForNewAiMessages()` - Yeni AI mesajı kontrolü

### Ana Sayfa Güncellemeleri (`app/(tabs)/index.tsx`)

#### Mesaj Sistemi Başlatma:

```typescript
const initializeMessaging = async (userId: string) => {
  await loadDoctorInfo(userId); // Doktor bilgilerini yükle
  await updateDashboardInfo(userId); // Dashboard'ı güncelle
  startMessageChecking(userId); // Otomatik kontrolü başlat
};
```

#### Dashboard Veri Dönüşümü:

```typescript
// Dashboard verilerini MessagesPreview formatına çevir
const doctorMessages: Message[] = [];
const aiMessages: Message[] = [];

if (dashboardDoctorInfo.latestMessage) {
  doctorMessages.push({
    id: dashboardDoctorInfo.latestMessage.id,
    sender: dashboardDoctorInfo.latestMessage.senderName || 'Doktor',
    content: dashboardDoctorInfo.latestMessage.content,
    timestamp: dashboardDoctorInfo.latestMessage.timestamp,
    isUnread: dashboardDoctorInfo.unreadCount > 0,
    type: 'doctor',
  });
}
```

### UI Bileşeni Güncellemeleri (`components/MessagesPreview.tsx`)

#### Yeni Props:

```typescript
interface MessagesPreviewProps {
  onDoctorPress: () => void; // Doktor butonuna tıklama
  onAssistantPress: () => void; // AI asistan butonuna tıklama
  doctorMessages?: Message[]; // Doktor mesajları
  aiMessages?: Message[]; // AI mesajları
  hasNewMessages?: boolean; // Yeni mesaj durumu
}
```

#### Yeni Tasarım:

- Sol üst: Logo + "Mesajlar" başlığı + toplam okunmamış sayısı
- Sağ üst: "Doktorum" ve "Asistan" butonları (her birinde ayrı sayaç)
- İçerik: Her chat türü için son mesaj önizlemesi

## 🔄 Mesaj Kontrol Akışı

### 1. Uygulama İlk Açılışı

```typescript
// Ana sayfa useEffect
useEffect(() => {
  if (user?.id) {
    initializeMessaging(user.id);
  }
}, [user?.id]);
```

### 2. Ana Sayfa Yüklenişi

```typescript
const initializeMessaging = async (userId: string) => {
  await loadDoctorInfo(userId);
  await updateDashboardInfo(userId); // İlk yükleme
  startMessageChecking(userId); // 10 saniyelik interval
};
```

### 3. Mesajlar Ekranına Geçiş

```typescript
useEffect(() => {
  if (user?.id && doctorInfo?.doctor_user_id) {
    loadMessages(user.id, doctorInfo.doctor_user_id);
    updateDashboardInfo(user.id); // Dashboard güncelle
  }
}, [user?.id, doctorInfo?.doctor_user_id]);
```

### 4. Mesaj Gönderme

```typescript
await sendMessage(content, senderUserId, receiverUserId, messageTypeId, isAiMessage);
get().updateDashboardInfo(senderUserId); // Gönderme sonrası güncelle
```

### 5. Otomatik Kontrol (Her 10 Saniye)

```typescript
setInterval(async () => {
  const hasNewDoctorMessages = await checkForNewDoctorMessages(userId);
  const hasNewAiMessages = await checkForNewAiMessages(userId);

  if (hasNewDoctorMessages || hasNewAiMessages) {
    await updateDashboardInfo(userId); // Yeni mesaj varsa güncelle
  }
}, 10000);
```

## 🤖 AI Mesaj Ayrıştırması

### Temel Mantık:

1. **AI mesajı kontrolü**: `message_type_name` alanında "değerlendirme" veya "ai" geçiyor mu?
2. **AI konuşma kontrolü**: Önceki/sonraki mesajlara bakarak AI konuşmasının parçası mı?
3. **Sender ID**: AI asistan mesajları kullanıcının kendi ID'si ile gönderiliyor

### Filtreleme Fonksiyonları:

```typescript
function isAiMessage(message: MessageWithDetails, userId: string): boolean {
  return (
    message.message_type_name?.toLowerCase().includes('değerlendirme') ||
    message.message_type_name?.toLowerCase().includes('ai') ||
    false
  );
}

function isAiConversation(messages: MessageWithDetails[], messageId: string): boolean {
  // Önceki ve sonraki mesajlara bakarak AI konuşması olup olmadığını anla
  const messageIndex = messages.findIndex((msg) => msg.id === messageId);
  const prevMessage = messages[messageIndex - 1];
  const nextMessage = messages[messageIndex + 1];

  return (
    (prevMessage && isAiMessage(prevMessage, '')) || (nextMessage && isAiMessage(nextMessage, ''))
  );
}
```

## 📊 Dashboard Bilgi Yapısı

```typescript
interface DashboardMessageInfo {
  latestMessage?: MessageBubbleData; // En son mesaj
  unreadCount: number; // Okunmamış sayısı
  lastUnreadMessage?: MessageBubbleData; // Son okunmamış mesaj
}
```

### Görüntüleme Mantığı:

- **Okunmamış mesaj varsa**: `lastUnreadMessage` gösterilir
- **Okunmamış mesaj yoksa**: `latestMessage` gösterilir
- **Hiç mesaj yoksa**: "Henüz mesaj yok" gösterilir

## 🎨 UI/UX Özellikleri

### Ana Sayfa Mesaj Kutusu:

- **Header**: Şikayetler bileşenine benzer tasarım
- **Butonlar**: Mavi (Doktor) + Yeşil (AI Asistan)
- **Rozetler**: Her butonda ayrı okunmamış sayısı
- **İçerik**: Her chat türü için son mesaj önizlemesi

### Renkli Göstergeler:

- 🔵 **Mavi**: Doktor mesajları (`#007bff`)
- 🟢 **Yeşil**: AI asistan mesajları (`#28a745`)
- 🔴 **Kırmızı**: Okunmamış mesaj rozetleri (`#dc3545`)

## 🚀 Gelecek Geliştirmeler

### Eklenmesi Gerekenler:

1. **AI Asistan Ekranı**: Ayrı bir AI chat ekranı
2. **Mesaj Okundu İşaretleme**: Read status güncellemesi
3. **Push Notification**: FCM entegrasyonu
4. **Offline Desteği**: Cached mesajlar
5. **Mesaj Arama**: İçerik bazlı arama
6. **Dosya Paylaşımı**: Görsel/döküman gönderimi

### Performans İyileştirmeleri:

1. **Pagination**: Büyük mesaj listelerinde sayfalama
2. **Lazy Loading**: Görünene kadar yükleme
3. **Memory Management**: Store temizliği
4. **Background Sync**: Uygulama kapalıyken sync

## 🐛 Bilinen Sorunlar

1. **Interval Cleanup**: Component unmount'ta interval temizliği
2. **Memory Leaks**: Store'da birikebilecek eski veriler
3. **Network Errors**: Offline durumda hata yönetimi
4. **Race Conditions**: Eşzamanlı mesaj yükleme sorunları

## 📝 Notlar

- Bu sistem **gerçek zamanlı değildir** - 10 saniye gecikme olabilir
- AI mesaj ayrıştırması **message_type_name** alanına bağımlıdır
- Dashboard güncellemeleri **manuel tetiklenir** (otomatik değil)
- Interval **sadece ana sayfada aktiftir**
