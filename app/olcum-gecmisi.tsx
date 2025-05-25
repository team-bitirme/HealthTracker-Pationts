import React, { useEffect } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DataEntryHeader } from '~/components/DataEntryHeader';
import { MeasurementListItem } from '~/components/MeasurementListItem';
import { useMeasurementHistoryStore, MeasurementRecord } from '~/store/measurementHistoryStore';
import { useProfileStore } from '~/store/profileStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function OlcumGecmisi() {
  const router = useRouter();
  const { categoryId, categoryTitle, measurementTypeId } = useLocalSearchParams<{
    categoryId: string;
    categoryTitle: string;
    measurementTypeId: string;
  }>();

  const { profile } = useProfileStore();
  const { 
    measurements, 
    isLoading, 
    error, 
    fetchMeasurementHistory, 
    clearMeasurements 
  } = useMeasurementHistoryStore();

  useEffect(() => {
    console.log('📊 Ölçüm geçmişi sayfası açıldı:', categoryTitle);
    
    return () => {
      // Cleanup when leaving the screen
      clearMeasurements();
    };
  }, []);

  useEffect(() => {
    if (profile?.patient_id && measurementTypeId) {
      fetchMeasurementHistory(profile.patient_id, parseInt(measurementTypeId));
    }
  }, [profile?.patient_id, measurementTypeId, fetchMeasurementHistory]);

  const handleMeasurementPress = (measurement: MeasurementRecord) => {
    console.log('📋 Ölçüm seçildi:', measurement.id);
    router.push({
      pathname: '/olcum-detay' as any,
      params: { 
        measurementId: measurement.id,
        categoryTitle: categoryTitle 
      }
    });
  };

  const renderMeasurementItem = ({ item }: { item: MeasurementRecord }) => (
    <MeasurementListItem
      measurement={item}
      onPress={handleMeasurementPress}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <FontAwesome name="info-circle" size={48} color="#6c757d" />
      <Text style={styles.emptyText}>Henüz ölçüm kaydı bulunmuyor</Text>
      <Text style={styles.emptySubText}>
        Bu kategori için veri ekleyerek ölçüm geçmişinizi oluşturmaya başlayın
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.centerContainer}>
      <FontAwesome name="exclamation-triangle" size={48} color="#ff6b6b" />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#007bff" />
      <Text style={styles.loadingText}>Ölçüm geçmişi yükleniyor...</Text>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return renderLoadingState();
    }

    if (error) {
      return renderErrorState();
    }

    if (measurements.length === 0) {
      return renderEmptyState();
    }

    return (
      <FlatList
        data={measurements}
        renderItem={renderMeasurementItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <DataEntryHeader title={`${categoryTitle} - Geçmiş`} />
      
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 