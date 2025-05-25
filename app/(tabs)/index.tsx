import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { ScreenContent } from '~/components/ScreenContent';
import { CustomHeader } from '~/components/CustomHeader';
import { MetricsGrid } from '~/components/MetricsGrid';
import { MessagesPreview, Message } from '~/components/MessagesPreview';
import { useAuthStore } from '~/store/authStore';
import { useProfileStore } from '~/store/profileStore';
import { patientService } from '~/services/patientService';
import { useFCMToken } from '~/lib/hooks/useFCMToken';

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
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  
  // FCM Token yönetimi
  const { token: fcmToken, isLoading: fcmLoading, error: fcmError } = useFCMToken();

  useEffect(() => {
    if (user?.id) {
      console.log('🔐 Kullanıcı girişi:', user.email);
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    if (profile?.patient_id) {
      console.log('📈 Metrikler yükleniyor...');
      loadMetrics();
    }
  }, [profile?.patient_id]);

  // FCM Token durumunu logla (sadece değişiklik olduğunda)
  useEffect(() => {
    if (fcmToken && user?.id) {
      console.log('🔔 FCM Token hazır:', {
        tokenLength: fcmToken.length,
        userId: user.id
      });
    }
    
    if (fcmError) {
      console.log('❌ FCM Token hatası:', fcmError);
    }
  }, [fcmToken, fcmError]);

  const loadMetrics = async () => {
    if (!profile?.patient_id) {
      console.log('❌ Hasta ID bulunamadı');
      return;
    }
    
    setIsLoadingMetrics(true);
    
    try {
      const measurements = await patientService.getLatestMeasurementsWithIdsForDashboard(profile.patient_id);
      
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

  // Mesajlar - şimdilik boş array, daha sonra gerçek verilerle doldurulacak
  const messages: Message[] = [];

  const handleMetricPress = (metricId: string) => {
    const metric = metrics.find((m) => m.id === metricId);
    console.log('📊 Metrik seçildi:', metric?.title);
    
    if (metric?.measurementId) {
      console.log('📋 Ölçüm detayına yönlendiriliyor:', metric.measurementId);
      router.push({
        pathname: '/olcum-detay' as any,
        params: { 
          measurementId: metric.measurementId,
          categoryTitle: metric.title 
        }
      });
    } else {
      Alert.alert(
        'Veri Bulunamadı',
        `${metric?.title} için henüz ölçüm verisi bulunmuyor.`
      );
    }
  };

  const handleMessagesPress = () => {
    console.log('💬 Mesajlar ekranına yönlendiriliyor');
    router.push('/mesajlar' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        <CustomHeader userName={profile ? `${profile.name || ''} ${profile.surname || ''}`.trim() || 'Kullanıcı' : 'Kullanıcı'} />
        <View style={styles.metricsContainer}>
          <MetricsGrid 
            metrics={metrics} 
            onCellPress={handleMetricPress}
            isLoading={isLoadingMetrics}
          />
        </View>

        <View style={styles.messagesSection}>
          <MessagesPreview
            messages={messages}
            onPress={handleMessagesPress}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#212529',
  },
});
