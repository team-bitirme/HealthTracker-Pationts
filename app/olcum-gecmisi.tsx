import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
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
  const { measurements, isLoading, error, fetchMeasurementHistory, clearMeasurements } =
    useMeasurementHistoryStore();

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
        categoryTitle: categoryTitle,
      },
    });
  };

  const handleAddMeasurement = () => {
    console.log('➕ Yeni veri ekleme butonu tıklandı');
    router.push({
      pathname: '/veri-ekleme-yontemi' as any,
      params: {
        categoryId,
        categoryTitle,
        measurementTypeId,
      },
    });
  };

  const renderAddButton = () => (
    <TouchableOpacity style={styles.addButton} onPress={handleAddMeasurement} activeOpacity={0.7}>
      <View style={styles.addButtonContent}>
        <View style={styles.addButtonIcon}>
          <FontAwesome name="plus" size={24} color="#fff" />
        </View>
        <View style={styles.addButtonText}>
          <Text style={styles.addButtonTitle}>Yeni Veri Ekle</Text>
          <Text style={styles.addButtonSubtitle}>
            {categoryTitle} kategorisi için yeni ölçüm kaydet
          </Text>
        </View>
        <View style={styles.addButtonArrow}>
          <FontAwesome name="chevron-right" size={16} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMeasurementItem = ({ item }: { item: MeasurementRecord }) => (
    <MeasurementListItem measurement={item} onPress={handleMeasurementPress} />
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

    return (
      <FlatList
        data={measurements}
        renderItem={renderMeasurementItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderAddButton}
        ListEmptyComponent={measurements.length === 0 ? renderEmptyState : null}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <DataEntryHeader title={`${categoryTitle} - Geçmiş`} />

      <View style={styles.content}>{renderContent()}</View>
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
  addButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  addButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addButtonText: {
    flex: 1,
  },
  addButtonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  addButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  addButtonArrow: {
    marginLeft: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
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
