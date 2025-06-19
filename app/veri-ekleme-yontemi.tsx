import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DataEntryHeader } from '~/components/DataEntryHeader';
import { Ionicons } from '@expo/vector-icons';

export default function VeriEklemeYontemi() {
  const router = useRouter();
  const { categoryId, categoryTitle, measurementTypeId } = useLocalSearchParams<{
    categoryId: string;
    categoryTitle: string;
    measurementTypeId?: string;
  }>();

  const handleManualEntry = () => {
    router.push({
      pathname: '/el-ile-giris' as any,
      params: { categoryId, categoryTitle, measurementTypeId }
    });
  };

  const handlePhotoEntry = () => {
    router.push({
      pathname: '/fotograf-ile-giris' as any,
      params: { categoryId, categoryTitle, measurementTypeId }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <DataEntryHeader title={`${categoryTitle} - Veri Ekleme`} />
      
      <View style={styles.content}>
        <Text style={styles.subtitle}>Veri ekleme yönteminizi seçin</Text>
        
        <View style={styles.methodsContainer}>
          <TouchableOpacity style={styles.methodButton} onPress={handleManualEntry}>
            <View style={styles.methodIconContainer}>
              <Ionicons name="create-outline" size={48} color="#007bff" />
            </View>
            <Text style={styles.methodTitle}>El ile Giriş</Text>
            <Text style={styles.methodDescription}>
              Değerleri manuel olarak girin
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.methodButton} onPress={handlePhotoEntry}>
            <View style={styles.methodIconContainer}>
              <Ionicons name="camera-outline" size={48} color="#28a745" />
            </View>
            <Text style={styles.methodTitle}>Fotoğraf ile Giriş</Text>
            <Text style={styles.methodDescription}>
              Fotoğraf çekerek değerleri otomatik okutun
            </Text>
          </TouchableOpacity>
        </View>
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
    padding: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  methodsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  methodButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  methodTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  methodDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 