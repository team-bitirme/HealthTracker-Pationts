import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { ScreenContent } from '~/components/ScreenContent';
import { CustomHeader } from '~/components/CustomHeader';
import { MetricsGrid } from '~/components/MetricsGrid';
import { MessagesPreview, Message } from '~/components/MessagesPreview';
import { ComplaintsPreview } from '~/components/ComplaintsPreview';
import { useComplaintsStore, Complaint } from '~/store/complaintsStore';
import { useAuthStore } from '~/store/authStore';
import { useProfileStore } from '~/store/profileStore';
import { patientService } from '~/services/patientService';
import { useFCMToken } from '~/lib/hooks/useFCMToken';

import { useMessagesStore } from '~/store/messagesStore';

interface MetricData {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  iconName?: React.ComponentProps<typeof FontAwesome>['name'];
  iconColor?: string;
  measurementId?: string;
}

export default function AnaSayfa() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const { complaints, fetchComplaints, isLoading: complaintsLoading } = useComplaintsStore();
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // FCM Token yönetimi
  const { token: fcmToken, isLoading: fcmLoading, error: fcmError } = useFCMToken();

  // Mesaj store
  const { dashboardDoctorInfo, dashboardAiInfo, updateDashboardInfo } = useMessagesStore();

  // Mesaj kontrolü artık global olarak _layout.tsx'te yapılıyor

  // Ana sayfaya focus olduğunda dashboard'ı güncelle
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 Ana sayfa focus oldu, dashboard güncelleniyor...');
      if (user?.id) {
        updateDashboardInfo(user.id);
      }
    }, [user?.id, updateDashboardInfo])
  );

  useEffect(() => {
    if (user?.id) {
      console.log('🔐 Kullanıcı girişi:', user.email);
      fetchProfile(user.id);
      initializeMessaging(user.id);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    if (profile?.patient_id) {
      console.log('📈 Metrikler yükleniyor...');
      loadMetrics();
    }
  }, [profile?.patient_id]);

  // Şikayetleri yükle
  useEffect(() => {
    if (profile?.patient_id) {
      console.log('🩺 Şikayetler yükleniyor...', profile.patient_id);
      fetchComplaints(profile.patient_id);
    }
  }, [profile?.patient_id, fetchComplaints]);

  // FCM Token durumunu logla (sadece değişiklik olduğunda)
  useEffect(() => {
    if (fcmToken && user?.id) {
      console.log('🔔 FCM Token hazır:', {
        tokenLength: fcmToken.length,
        userId: user.id,
      });
    }

    if (fcmError) {
      console.log('❌ FCM Token hatası:', fcmError);
    }
  }, [fcmToken, fcmError]);

  // Global mesaj kontrolü _layout.tsx'te yönetiliyor

  const initializeMessaging = async (userId: string) => {
    try {
      console.log('💬 Dashboard mesaj bilgileri güncelleniyor...');

      // Dashboard bilgilerini güncelle (global sistem zaten çalışıyor)
      await updateDashboardInfo(userId);

      console.log('✅ Dashboard mesaj bilgileri hazır');
    } catch (error) {
      console.error('❌ Dashboard mesaj bilgileri güncellenemedi:', error);
    }
  };

  const loadMetrics = async () => {
    if (!profile?.patient_id) {
      console.log('❌ Hasta ID bulunamadı');
      return;
    }

    setIsLoadingMetrics(true);

    try {
      const measurements = await patientService.getLatestMeasurementsWithIdsForDashboard(
        profile.patient_id
      );

      const metricsData: MetricData[] = [
        {
          id: 'heart-rate',
          title: 'Nabız',
          value: measurements.heart_rate?.value || 0,
          unit: 'bpm',
          iconName: 'heart' as React.ComponentProps<typeof FontAwesome>['name'],
          iconColor: '#ff8787',
          measurementId: measurements.heart_rate?.id,
        },
        {
          id: 'blood-pressure',
          title: 'Tansiyon',
          value: measurements.blood_pressure?.value || 0,
          unit: 'mmHg',
          iconName: 'line-chart' as React.ComponentProps<typeof FontAwesome>['name'],
          iconColor: '#4dabf7',
          measurementId: measurements.blood_pressure?.id,
        },
        {
          id: 'oxygen-saturation',
          title: 'SpO2',
          value: measurements.oxygen_saturation?.value || 0,
          unit: '%',
          iconName: 'heartbeat' as React.ComponentProps<typeof FontAwesome>['name'],
          iconColor: '#4dabf7',
          measurementId: measurements.oxygen_saturation?.id,
        },
        {
          id: 'temperature',
          title: 'Vücut Sıcaklığı',
          value: measurements.temperature?.value || 0,
          unit: '°C',
          iconName: 'thermometer-quarter' as React.ComponentProps<typeof FontAwesome>['name'],
          iconColor: '#69db7c',
          measurementId: measurements.temperature?.id,
        },
      ];

      console.log('✅ Metrikler yüklendi');
      setMetrics(metricsData);
    } catch (error) {
      console.error('❌ Metrik yükleme hatası:', error);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  // Mesajlar - dashboard bilgilerinden alıyoruz
  const doctorMessages: Message[] = [];
  const aiMessages: Message[] = [];

  // Dashboard verilerini Message formatına çevir
  // Önce okunmamış mesajı kontrol et, yoksa en son mesajı göster
  if (dashboardDoctorInfo.lastUnreadMessage) {
    doctorMessages.push({
      id: dashboardDoctorInfo.lastUnreadMessage.id,
      sender: dashboardDoctorInfo.lastUnreadMessage.senderName || 'Doktor',
      content: dashboardDoctorInfo.lastUnreadMessage.content,
      timestamp: dashboardDoctorInfo.lastUnreadMessage.timestamp,
      isUnread: true,
      type: 'doctor',
    });
  } else if (dashboardDoctorInfo.latestMessage) {
    doctorMessages.push({
      id: dashboardDoctorInfo.latestMessage.id,
      sender:
        dashboardDoctorInfo.latestMessage.senderName ||
        (dashboardDoctorInfo.latestMessage.isOwn ? 'Sen' : 'Doktor'),
      content: dashboardDoctorInfo.latestMessage.content,
      timestamp: dashboardDoctorInfo.latestMessage.timestamp,
      isUnread: false,
      type: 'doctor',
    });
  }

  // AI mesajları için de aynı mantık
  if (dashboardAiInfo.lastUnreadMessage) {
    aiMessages.push({
      id: dashboardAiInfo.lastUnreadMessage.id,
      sender: dashboardAiInfo.lastUnreadMessage.senderName || 'AI Asistan',
      content: dashboardAiInfo.lastUnreadMessage.content,
      timestamp: dashboardAiInfo.lastUnreadMessage.timestamp,
      isUnread: true,
      type: 'ai',
    });
  } else if (dashboardAiInfo.latestMessage) {
    aiMessages.push({
      id: dashboardAiInfo.latestMessage.id,
      sender:
        dashboardAiInfo.latestMessage.senderName ||
        (dashboardAiInfo.latestMessage.isOwn ? 'Sen' : 'AI Asistan'),
      content: dashboardAiInfo.latestMessage.content,
      timestamp: dashboardAiInfo.latestMessage.timestamp,
      isUnread: false,
      type: 'ai',
    });
  }

  const handleMetricPress = (metricId: string) => {
    const metric = metrics.find((m) => m.id === metricId);
    console.log('📊 Metrik seçildi:', metric?.title);

    if (metric?.measurementId) {
      console.log('📋 Ölçüm detayına yönlendiriliyor:', metric.measurementId);
      router.push({
        pathname: '/olcum-detay' as any,
        params: {
          measurementId: metric.measurementId,
          categoryTitle: metric.title,
        },
      });
    } else {
      Alert.alert('Veri Bulunamadı', `${metric?.title} için henüz ölçüm verisi bulunmuyor.`);
    }
  };

  const handleDoctorPress = () => {
    console.log('💬 Doktor mesajlarına yönlendiriliyor');
    setHasNewMessages(false);
    router.push('/mesajlar' as any);
  };

  const handleAssistantPress = () => {
    console.log('🤖 AI Asistan mesajlarına yönlendiriliyor');
    router.push('/ai-asistan' as any);
  };

  const handleAddComplaintPress = () => {
    console.log('🩺 Yeni şikayet ekranına yönlendiriliyor');
    router.push('/yeni-sikayet' as any);
  };

  const handleComplaintPress = (complaint: Complaint) => {
    console.log('🩺 Şikayet düzenleme ekranına yönlendiriliyor:', complaint.id);
    router.push({
      pathname: '/sikayet-duzenle' as any,
      params: { complaintId: complaint.id },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        <CustomHeader
          userName={
            profile
              ? `${profile.name || ''} ${profile.surname || ''}`.trim() || 'Kullanıcı'
              : 'Kullanıcı'
          }
        />
        <View style={styles.metricsContainer}>
          <MetricsGrid
            metrics={metrics}
            onCellPress={handleMetricPress}
            isLoading={isLoadingMetrics}
          />
        </View>

        <View style={styles.messagesSection}>
          <MessagesPreview
            messages={[]}
            onDoctorPress={handleDoctorPress}
            onAssistantPress={handleAssistantPress}
            doctorMessages={doctorMessages}
            aiMessages={aiMessages}
            hasNewMessages={hasNewMessages}
            unreadDoctorCount={dashboardDoctorInfo.unreadCount}
            unreadAiCount={dashboardAiInfo.unreadCount}
          />
        </View>

        <View style={styles.complaintsSection}>
          <ComplaintsPreview
            complaints={complaints}
            onAddPress={handleAddComplaintPress}
            onComplaintPress={handleComplaintPress}
          />
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
  metricsContainer: {
    marginVertical: 16,
  },
  messagesSection: {
    marginTop: 16,
  },
  complaintsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#212529',
  },
});
