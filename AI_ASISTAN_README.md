# AI Asistan Entegrasyonu

## Genel Bakış

AI asistan artık Google Gemini API kullanarak gerçek zamanlı yanıtlar verebiliyor. Hasta bir mesaj gönderdiğinde:

1. Mesaj Supabase'e kaydedilir
2. Hasta bilgileri (ölçümler, şikayetler) toplanır
3. Contextualized prompt oluşturulur
4. Gemini API'ya gönderilir
5. AI yanıtı alınır ve Supabase'e kaydedilir

## Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Environment Variable Ayarlama

`.env` dosyası oluşturun ve Gemini API anahtarınızı ekleyin:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Gemini API Anahtarı Alma

1. [Google AI Studio](https://makersuite.google.com/app/apikey)'ya gidin
2. Yeni API anahtarı oluşturun
3. Anahtarı `.env` dosyasına ekleyin

## Yeni Özellikler

### AI Store (`store/aiStore.ts`)

- Gemini API entegrasyonu
- Hasta bağlamı toplama
- Akıllı prompt oluşturma
- Hata yönetimi

### Messages Store Güncellemeleri

- `sendAiMessage()` fonksiyonu eklendi
- AI mesaj işleme pipeline'ı
- Otomatik yanıt üretme

### AI Asistan Ekranı Güncellemeleri

- Yeni AI entegrasyonu
- Gerçek zamanlı yanıtlar
- Gelişmiş hata handling

## API Kullanımı

### Temel Kullanım

```typescript
import { useAIStore } from '~/store/aiStore';

const { setApiKey, generateResponse } = useAIStore();

// API anahtarını ayarla
setApiKey('your-api-key');

// Yanıt üret
await generateResponse('Merhaba', patientId, userId);
```

### Hasta Bağlamı

AI asistan şu bilgileri kullanarak yanıt verir:

- Hasta adı, yaşı, cinsiyeti
- Son 5 sağlık ölçümü
- Aktif şikayetler
- Geçmiş mesajlar

## Güvenlik

⚠️ **ÖNEMLİ**:

- API anahtarlarını `.env` dosyasında saklayın
- `.env` dosyasını `.gitignore`'a ekleyin
- Production'da environment variable'ları güvenli şekilde yönetin

## Troubleshooting

### Yaygın Hatalar

1. **"Gemini API anahtarı bulunamadı"**

   - `.env` dosyasının doğru konumda olduğunu kontrol edin
   - API anahtarının doğru formatda olduğunu kontrol edin

2. **"AI yanıt üretilemedi"**

   - İnternet bağlantınızı kontrol edin
   - API anahtarının geçerli olduğunu kontrol edin
   - API limitlerini kontrol edin

3. **Hasta bilgileri alınamıyor**
   - Hasta profil bilgilerinin tam olduğunu kontrol edin
   - Supabase bağlantısını kontrol edin

## Geliştirme Notları

- AI yanıtları maksimum 200 kelime ile sınırlıdır
- Tıbbi tavsiye verilmez, sadece genel bilgi paylaşılır
- Acil durumlar için doktora yönlendirme yapılır
- Türkçe yanıtlar verilir

## Test Etme

1. AI asistan ekranına gidin
2. Bir mesaj gönderin
3. AI yanıtının geldiğini kontrol edin
4. Yanıtın hasta bilgilerine uygun olduğunu kontrol edin
