# HealthTracker - Hasta Uygulaması

Diyabet hastaları için geliştirilmiş sağlık takip uygulaması.

## Özellikler

### 📊 Sağlık Verileri Takibi
- Kan şekeri ölçümleri
- Tansiyon takibi
- Nabız monitörü
- Vücut sıcaklığı ölçümü
- SpO2 (oksijen satürasyonu) takibi

### 📱 Veri Girişi
- Manuel veri girişi
- Fotoğraf ile veri girişi (OCR)
- El ile veri girişi

### 💬 Mesajlaşma Sistemi
- Doktor ile güvenli mesajlaşma
- AI asistan desteği
- Sistem bildirimleri
- Farklı mesaj tipleri (doktor, AI, sistem)
- Mesaj durumu takibi (gönderiliyor, gönderildi, teslim edildi, okundu)
- Gerçek zamanlı mesajlaşma arayüzü

### 🔔 Push Notification Sistemi
- Firebase Cloud Messaging (FCM) entegrasyonu
- Kullanıcı oturum açtığında otomatik token kaydı
- Kullanıcı çıkış yaptığında token pasifleştirme
- Token yenilenme otomatik takibi
- Platform bazlı (iOS/Android) token yönetimi
- Cihaz bilgisi ile token eşleştirme
- Upsert mantığı ile tekrar eden token kayıtlarını önleme

### 📈 Veri Görselleştirme
- Ölçüm geçmişi
- Grafik görünümler
- Detaylı analiz raporları

## Teknik Detaylar

### Kullanılan Teknolojiler
- **React Native** - Mobil uygulama geliştirme
- **Expo** - Geliştirme ve dağıtım platformu
- **TypeScript** - Tip güvenli JavaScript
- **Zustand** - State management
- **React Navigation** - Navigasyon yönetimi
- **Firebase Cloud Messaging** - Push notification servisi
- **Supabase** - Backend ve veritabanı

### Proje Yapısı
```
app/
├── (auth)/          # Kimlik doğrulama ekranları
├── (tabs)/          # Ana tab navigasyon ekranları
├── mesajlar.tsx     # Tam ekran mesajlaşma ekranı
└── ...

components/
├── MessagesPreview.tsx  # Ana ekran mesaj önizlemesi
├── ChatHeader.tsx       # Mesajlaşma ekranı header'ı
├── MessageBubble.tsx    # Mesaj balonu komponenti
├── MessageInput.tsx     # Mesaj yazma alanı
└── ...

lib/
├── hooks/
│   └── useFCMToken.ts   # FCM token yönetimi hook'u
├── types/
│   ├── database.ts      # Veritabanı tipleri
│   └── supabase.ts      # Supabase tipleri
└── firebase.ts          # Firebase konfigürasyonu

store/
├── messagesStore.ts     # Mesajlar state management
├── authStore.ts         # Kimlik doğrulama store (FCM entegreli)
└── ...

services/
├── messagesService.ts   # Mesajlaşma API servisleri
├── fcmTokenService.ts   # FCM token yönetimi servisi
├── patientService.ts    # Hasta verileri servisleri
└── ...
```

### FCM Token Yönetimi

#### Veritabanı Yapısı
```sql
fcm_tokens tablosu:
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key -> users.id)
- token: TEXT (FCM Token)
- platform: TEXT (ios/android)
- device_info: TEXT (JSON format cihaz bilgileri)
- is_active: BOOLEAN (Token aktif mi?)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### Özellikler
- **Otomatik Token Yönetimi**: Kullanıcı giriş/çıkış durumlarında otomatik token işlemleri
- **Upsert Mantığı**: Aynı token tekrar kaydedilmez, mevcut token güncellenir
- **Platform Desteği**: iOS ve Android için ayrı token yönetimi
- **Cihaz Bilgisi**: Token ile birlikte cihaz bilgileri de kaydedilir
- **Token Yenileme**: Firebase token yenilendiğinde otomatik güncelleme
- **Pasifleştirme**: Kullanıcı çıkış yaptığında eski token'lar pasifleştirilir

#### Kullanım
```typescript
// Hook kullanımı
const { token, isLoading, error, getToken, saveToken } = useFCMToken();

// Manuel token alma
const fcmToken = await getToken();

// Token kaydetme
await saveToken(fcmToken);
```

### Mesajlaşma Sistemi Özellikleri

#### Mesaj Tipleri
- **Doctor**: Doktordan gelen mesajlar (yeşil tema)
- **AI**: AI asistanından gelen mesajlar (mor tema)
- **System**: Sistem bildirimleri (gri tema)
- **User**: Kullanıcının gönderdiği mesajlar (mavi tema)

#### Mesaj Durumları
- **Sending**: Mesaj gönderiliyor
- **Sent**: Mesaj gönderildi
- **Delivered**: Mesaj teslim edildi
- **Read**: Mesaj okundu

#### Özellikler
- Responsive tasarım
- Keyboard-aware input
- Auto-scroll to latest message
- Message status indicators
- Unread message badges
- Empty state handling

## Kurulum

1. Projeyi klonlayın
```bash
git clone [repository-url]
cd HealthTracker-Pationts
```

2. Bağımlılıkları yükleyin
```bash
npm install
```

3. Firebase konfigürasyonu
```bash
# Firebase paketlerini yükleyin
npm install @react-native-firebase/app @react-native-firebase/messaging

# Firebase konfigürasyon dosyalarını ekleyin
# - Android: google-services.json (proje kök dizinine)
# - iOS: GoogleService-Info.plist (proje kök dizinine)
```

4. Uygulamayı başlatın
```bash
npx expo start
```

## Geliştirme Notları

### FCM Token Sistemi
- Fiziksel cihazda test edilmelidir (emülatörde çalışmaz)
- Firebase Console'dan test mesajları gönderilebilir
- Token'lar veritabanında güvenli şekilde saklanır
- Kullanıcı oturum durumları ile senkronize çalışır

### Mesajlaşma Sistemi
- Şu anda mock verilerle çalışmaktadır
- Gerçek API entegrasyonu için `messagesService.ts` dosyasındaki yorum satırları açılmalıdır
- WebSocket entegrasyonu gerçek zamanlı mesajlaşma için eklenebilir
- Push notification desteği FCM ile entegre edilmiştir

### Güvenlik
- Mesajlar end-to-end şifreleme ile korunmalıdır
- API çağrıları için authentication token'ları kullanılmalıdır
- Hassas veriler için ek güvenlik katmanları eklenmelidir
- FCM token'ları güvenli şekilde saklanır ve yönetilir

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. 