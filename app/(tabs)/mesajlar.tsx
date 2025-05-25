import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomHeader } from '~/components/CustomHeader';
import { useAuthStore } from '~/store/authStore';
import { useProfileStore } from '~/store/profileStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function Mesajlar() {
  const { user } = useAuthStore();
  const { profile } = useProfileStore();

  useEffect(() => {
    console.log('💬 Mesajlar sayfası açıldı');
  }, []);

  const renderDoctorInfo = () => {
    if (profile?.doctor_name && profile?.doctor_surname) {
      return (
        <View style={styles.doctorCard}>
          <View style={styles.doctorHeader}>
            <FontAwesome name="user-md" size={24} color="#28a745" />
            <Text style={styles.doctorTitle}>Doktorunuz</Text>
          </View>
          <Text style={styles.doctorName}>
            Dr. {profile.doctor_name} {profile.doctor_surname}
          </Text>
          {profile.doctor_specialization && (
            <Text style={styles.doctorSpecialization}>
              {profile.doctor_specialization}
            </Text>
          )}
        </View>
      );
    }

    return (
      <View style={styles.noDoctorCard}>
        <FontAwesome name="user-times" size={24} color="#dc3545" />
        <Text style={styles.noDoctorText}>
          Henüz bir doktor ataması yapılmamış
        </Text>
        <Text style={styles.noDoctorSubText}>
          Mesajlaşma özelliği için doktor ataması gereklidir
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        <CustomHeader title="Mesajlar" />
        
        <View style={styles.content}>
          <View style={styles.centerContainer}>
            <FontAwesome name="comments" size={64} color="#6c757d" />
            <Text style={styles.title}>Mesajlaşma</Text>
            <Text style={styles.subtitle}>
              Doktorunuz ile güvenli mesajlaşma özelliği yakında aktif olacak
            </Text>
            
            {renderDoctorInfo()}
            
            {profile?.name && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  Merhaba {profile.name} {profile.surname}
                </Text>
                <Text style={styles.infoSubText}>
                  Doktorunuz ile güvenli mesajlaşma imkanı sunacağız
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 24,
  },
  content: {
    flex: 1,
    minHeight: 400,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  doctorCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
    alignItems: 'center',
    minWidth: 280,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  noDoctorCard: {
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    alignItems: 'center',
    minWidth: 280,
  },
  noDoctorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc3545',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  noDoctorSubText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoSubText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 