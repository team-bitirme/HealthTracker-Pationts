# Diyabet Takip Uygulaması

React Native Expo uygulaması ile Supabase authentication sistemi.

## Kurulum

### 1. Gerekli Paketler

Aşağıdaki paketler zaten yüklenmiştir:

```bash
npx expo install @supabase/supabase-js@2.49.6 @react-native-async-storage/async-storage react-native-url-polyfill zustand
```

### 2. Environment Variables

Proje kök dizininde `.env` dosyası oluşturun:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Development User (for testing)
EXPO_PUBLIC_DEV_USER_EMAIL=test@example.com
EXPO_PUBLIC_DEV_USER_PASSWORD=123456
```

### 3. Supabase Kurulumu

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. Project Settings > API'den URL ve anon key'i alın
4. `.env` dosyasına ekleyin

## Özellikler

### ✅ Tamamlanan Özellikler

- **Authentication Service** (`services/auth.ts`)
  - Email/şifre ile giriş
  - Çıkış yapma
  - Şifre sıfırlama (OTP ile)
  - Şifre güncelleme
  - Session yönetimi
  - Hata yönetimi (Türkçe mesajlar)

- **State Management** (`store/authStore.ts`)
  - Zustand ile global state
  - Authentication durumu
  - Loading states
  - Session persistence

- **UI Screens**
  - Login sayfası (`app/(auth)/login.tsx`)
  - Şifre sıfırlama (`app/(auth)/forgot-password.tsx`)
  - Şifre güncelleme (`app/(auth)/update-password.tsx`)

- **Navigation**
  - Auth guard (giriş yapmış kullanıcılar ana sayfaya yönlendirilir)
  - Otomatik yönlendirme
  - Protected routes

- **Development Features**
  - Geliştirme ortamında otomatik kullanıcı bilgileri
  - Console logging
  - Debug bilgileri

### 🔧 Teknik Detaylar

#### Dosya Yapısı

```
lib/
  supabase.ts          # Supabase client konfigürasyonu
services/
  auth.ts              # Authentication servisleri
store/
  authStore.ts         # Global state management
app/
  (auth)/
    login.tsx          # Giriş sayfası
    forgot-password.tsx # Şifre sıfırlama
    update-password.tsx # Şifre güncelleme
    _layout.tsx        # Auth layout
  _layout.tsx          # Ana layout (auth guard)
  index.tsx            # Ana sayfa (yönlendirme)
```

#### Authentication Flow

1. **Uygulama Başlangıcı**
   - Auth store initialize edilir
   - Mevcut session kontrol edilir
   - Kullanıcı durumuna göre yönlendirme

2. **Giriş Yapma**
   - Email/şifre validasyonu
   - Supabase auth API çağrısı
   - Session storage
   - Ana sayfaya yönlendirme

3. **Şifre Sıfırlama**
   - Email validasyonu
   - OTP gönderimi
   - Deep link ile şifre güncelleme

4. **Çıkış Yapma**
   - Session temizleme
   - Login sayfasına yönlendirme

### 🚀 Kullanım

#### Development Mode

Geliştirme ortamında uygulama otomatik olarak test kullanıcısı bilgilerini doldurur:

```typescript
// lib/supabase.ts
export const DEV_USER = {
  email: process.env.EXPO_PUBLIC_DEV_USER_EMAIL || 'test@example.com',
  password: process.env.EXPO_PUBLIC_DEV_USER_PASSWORD || '123456',
};
```

#### Production

Production'da `.env` dosyasındaki gerçek Supabase bilgilerini kullanın.

### 📱 Ekranlar

1. **Login Screen**
   - Email/şifre girişi
   - "Şifremi unuttum" linki
   - Geliştirme modunda otomatik doldurma

2. **Forgot Password Screen**
   - Email girişi
   - OTP gönderimi
   - Başarı mesajı

3. **Update Password Screen**
   - Yeni şifre girişi
   - Şifre onayı
   - Şifre gereksinimleri gösterimi

### 🔐 Güvenlik

- Şifreler minimum 6 karakter
- Email validasyonu
- Session persistence
- Automatic token refresh
- Error handling
- Input sanitization

### 🌐 Çoklu Dil Desteği

Şu anda Türkçe desteklenmektedir. Hata mesajları ve UI metinleri Türkçe'dir.

### 📝 Notlar

- Kayıt olma özelliği bulunmamaktadır (istek gereği)
- OTP sistemi email üzerinden çalışır
- Deep linking `diabetesisp://` scheme'i kullanır
- AsyncStorage ile session persistence
- Zustand ile state management

## Geliştirme

```bash
# Uygulamayı başlat
npm start

# Android
npm run android

# iOS
npm run ios
``` 