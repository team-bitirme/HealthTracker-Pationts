import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { ProfileHeader } from '~/components/ProfileHeader';
import { ProfileCard } from '~/components/ProfileCard';
import { useAuthStore } from '~/store/authStore';
import { useProfileStore } from '~/store/profileStore';
import { patientService } from '~/services/patientService';

const ProfileScreen = () => {
  const { user, signOut } = useAuthStore();
  const { profile, isLoading, error, fetchProfile, clearProfile } = useProfileStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              clearProfile();
              await signOut();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Hata', 'Çıkış işlemi sırasında bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(prev => !prev);
    Alert.alert(
      'Bildirimler',
      `Bildirimler ${!notificationsEnabled ? 'açıldı' : 'kapatıldı'}.`
    );
  };

  const toggleDarkMode = () => {
    setDarkModeEnabled(prev => !prev);
    Alert.alert(
      'Koyu Mod',
      `Koyu mod ${!darkModeEnabled ? 'açıldı' : 'kapatıldı'}. Tema güncellemesi gerekiyor.`
    );
  };

  const renderLoadingState = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#007bff" />
      <Text style={styles.loadingText}>Profil bilgileri yükleniyor...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.centerContainer}>
      <FontAwesome name="exclamation-triangle" size={48} color="#ff6b6b" />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={() => user?.id && fetchProfile(user.id)}
      >
        <Text style={styles.retryButtonText}>Tekrar Dene</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProfileContent = () => {
    if (!profile) return null;

    const age = profile.birth_date ? patientService.calculateAge(profile.birth_date) : null;

    return (
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        <ProfileHeader title="Profil" />

        <View style={styles.profileHeader}>
          <Image 
            source={require('../assets/default-avatar.png')} 
            style={styles.profileImage} 
          />
          <Text style={[styles.userName, darkModeEnabled && styles.textDark]}>
            {`${profile.name || ''} ${profile.surname || ''}`.trim() || 'İsim belirtilmemiş'}
          </Text>
          <Text style={[styles.userEmail, darkModeEnabled && styles.textDarkMuted]}>
            {profile.email}
          </Text>
          {profile.patient_note && (
            <Text style={[styles.userBio, darkModeEnabled && styles.textDarkMuted]}>
              {profile.patient_note}
            </Text>
          )}
        </View>

        {/* Patient Information Cards */}
        <View style={styles.patientInfoSection}>
          <Text style={[styles.sectionTitle, darkModeEnabled && styles.textDark]}>
            Kişisel Bilgiler
          </Text>
          
          {/* Doctor Information */}
          {profile.doctor_name && profile.doctor_surname ? (
            <ProfileCard
              title="Doktorum"
              icon="user-md"
              iconColor="#28a745"
              value={`Dr. ${profile.doctor_name} ${profile.doctor_surname}`}
              subtitle={profile.doctor_specialization || 'Uzmanlık alanı belirtilmemiş'}
            />
          ) : (
            <ProfileCard
              title="Doktorum"
              icon="user-md"
              iconColor="#6c757d"
              value="Doktor ataması yapılmamış"
              subtitle="Lütfen yöneticinizle iletişime geçin"
            />
          )}
          
          {age && (
            <ProfileCard
              title="Yaş"
              icon="calendar"
              iconColor="#ff8787"
              value={`${age} yaşında`}
              subtitle={profile.birth_date ? `Doğum: ${new Date(profile.birth_date).toLocaleDateString('tr-TR')}` : undefined}
            />
          )}
          
          <ProfileCard
            title="Cinsiyet"
            icon="venus-mars"
            iconColor="#845ef7"
            value={patientService.formatGender(profile.gender_name)}
          />
          
          <ProfileCard
            title="Üyelik Tarihi"
            icon="clock-o"
            iconColor="#fd7e14"
            value={profile.created_at ? new Date(profile.created_at).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
          />
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, darkModeEnabled && styles.textDark]}>
            Ayarlar
          </Text>

          <View style={styles.settingItem}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={darkModeEnabled ? '#ccc' : '#555'}
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, darkModeEnabled && styles.textDark]}>
              Bildirimleri Aç
            </Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notificationsEnabled ? '#007bff' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleNotifications}
              value={notificationsEnabled}
            />
          </View>

          <View style={styles.settingItem}>
            <Ionicons
              name="moon-outline"
              size={24}
              color={darkModeEnabled ? '#ccc' : '#555'}
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, darkModeEnabled && styles.textDark]}>
              Koyu Mod
            </Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={darkModeEnabled ? '#007bff' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleDarkMode}
              value={darkModeEnabled}
            />
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert('Gizlilik Politikası', 'Gizlilik politikası gösteriliyor.')}>
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color={darkModeEnabled ? '#ccc' : '#555'}
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, darkModeEnabled && styles.textDark]}>
              Gizlilik Politikası
            </Text>
            <Ionicons
              name="chevron-forward-outline"
              size={24}
              color={darkModeEnabled ? '#ccc' : '#888'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert('Kullanım Şartları', 'Kullanım şartları gösteriliyor.')}>
            <Ionicons
              name="document-text-outline"
              size={24}
              color={darkModeEnabled ? '#ccc' : '#555'}
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, darkModeEnabled && styles.textDark]}>
              Kullanım Şartları
            </Text>
            <Ionicons
              name="chevron-forward-outline"
              size={24}
              color={darkModeEnabled ? '#ccc' : '#888'}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        style={[styles.container, darkModeEnabled && styles.containerDark]}
        edges={['left', 'right', 'bottom']}>
        {isLoading && renderLoadingState()}
        {error && !isLoading && renderErrorState()}
        {!isLoading && !error && renderProfileContent()}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  textDark: {
    color: '#e0e0e0',
  },
  textDarkMuted: {
    color: '#a0a0a0',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#007bff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  userBio: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  patientInfoSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  settingsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#444',
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#dc3545',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
