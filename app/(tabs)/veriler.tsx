import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, Text } from 'react-native';
import { DataCategoryList, DataCategory } from '~/components/DataCategoryList';
import { CustomHeader } from '~/components/CustomHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '~/store/authStore';
import { useProfileStore } from '~/store/profileStore';
import { useMeasurementStore } from '~/store/measurementStore';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function Veriler() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile } = useProfileStore();
  const { categories, isLoading, error, fetchCategories } = useMeasurementStore();

  useEffect(() => {
    console.log('📊 Veriler sayfası açıldı');
  }, []);

  useEffect(() => {
    if (profile?.patient_id) {
      fetchCategories(profile.patient_id);
    }
  }, [profile?.patient_id, fetchCategories]);

  useEffect(() => {
    console.log('📱 Veriler: Categories state changed:', {
      count: categories.length,
      isLoading,
      error,
      categories: categories.map(c => ({ id: c.id, title: c.title, latestValue: c.latestValue }))
    });
  }, [categories, isLoading, error]);

  const handleSelectCategory = (category: DataCategory) => {
    console.log('📊 Kategori seçildi:', category.title);
    router.push({
      pathname: '/olcum-gecmisi' as any,
      params: { 
        categoryId: category.id,
        categoryTitle: category.title,
        measurementTypeId: category.measurementTypeId?.toString() || ''
      }
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Sağlık verileri yükleniyor...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <FontAwesome name="exclamation-triangle" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (categories.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <FontAwesome name="info-circle" size={48} color="#6c757d" />
          <Text style={styles.emptyText}>Henüz sağlık verisi bulunmuyor</Text>
          <Text style={styles.emptySubText}>Veri Ekle sekmesinden yeni veriler ekleyebilirsiniz</Text>
        </View>
      );
    }

    return (
      <DataCategoryList
        categories={categories}
        onSelectCategory={handleSelectCategory}
        title="Sağlık Verilerim"
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        <CustomHeader title="Veriler" />
        {renderContent()}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
