import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { DataEntryHeader } from '~/components/DataEntryHeader';
import { useComplaintsStore } from '~/store/complaintsStore';
import { useProfileStore } from '~/store/profileStore';
import { supabase } from '~/lib/supabase';

export default function SikayetDuzenle() {
  const router = useRouter();
  const { complaintId } = useLocalSearchParams<{ complaintId: string }>();
  const { profile } = useProfileStore();
  const {
    categories,
    subcategories,
    complaints,
    fetchCategories,
    fetchSubcategories,
    fetchComplaints,
    updateComplaint,
    endComplaint,
    isLoading,
    isSubmitting: storeSubmitting,
    error,
    clearError,
  } = useComplaintsStore();

  // Form state
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [selectedSubcategoryName, setSelectedSubcategoryName] = useState('');

  // Modal states
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subcategoryModalVisible, setSubcategoryModalVisible] = useState(false);

  // Current complaint
  const currentComplaint = complaints.find((c) => c.id === complaintId);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (categories.length === 0) {
        await fetchCategories();
      }
      if (subcategories.length === 0) {
        await fetchSubcategories();
      }
      if (profile?.patient_id && complaints.length === 0) {
        await fetchComplaints(profile.patient_id);
      }
    };

    loadData();
  }, []);

  // Load complaint data when available
  useEffect(() => {
    if (currentComplaint && subcategories.length > 0 && categories.length > 0) {
      setDescription(currentComplaint.description || '');

      // Find subcategory and category
      const subcategory = subcategories.find((s) => s.id === currentComplaint.subcategory_id);
      if (subcategory) {
        setSelectedSubcategory(subcategory.id);
        setSelectedSubcategoryName(subcategory.name);

        const category = categories.find((c) => c.id === subcategory.category_id);
        if (category) {
          setSelectedCategory(category.id);
          setSelectedCategoryName(category.name);
        }
      }
    }
  }, [currentComplaint, subcategories, categories]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    setSelectedCategory(categoryId);
    setSelectedCategoryName(categoryName);
    setSelectedSubcategory(null);
    setSelectedSubcategoryName('');
    setCategoryModalVisible(false);
  };

  const handleSubcategorySelect = (subcategoryId: string, subcategoryName: string) => {
    setSelectedSubcategory(subcategoryId);
    setSelectedSubcategoryName(subcategoryName);
    setSubcategoryModalVisible(false);
  };

  const getFilteredSubcategories = () => {
    if (!selectedCategory) return [];
    return subcategories.filter((sub) => sub.category_id === selectedCategory);
  };

  const handleUpdate = async () => {
    if (!profile?.patient_id) {
      Alert.alert('Hata', 'Kullanıcı bilgileri bulunamadı');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen şikayet açıklamasını girin');
      return;
    }

    if (!selectedSubcategory) {
      Alert.alert('Eksik Bilgi', 'Lütfen kategori ve alt kategori seçin');
      return;
    }

    const success = await updateComplaint(complaintId!, {
      description: description.trim(),
      subcategory_id: selectedSubcategory,
      patient_id: profile.patient_id,
    });

    if (success) {
      Alert.alert('Başarılı', 'Şikayet başarıyla güncellendi', [
        {
          text: 'Tamam',
          onPress: () => router.back(),
        },
      ]);
    }
  };

  const handleEndComplaint = () => {
    Alert.alert(
      'Şikayeti Sonlandır',
      'Bu şikayeti sonlandırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sonlandır',
          style: 'destructive',
          onPress: async () => {
            const success = await endComplaint(complaintId!);

            if (success) {
              // Refresh complaints and go back
              if (profile?.patient_id) {
                await fetchComplaints(profile.patient_id);
              }

              Alert.alert('Başarılı', 'Şikayet başarıyla sonlandırıldı', [
                {
                  text: 'Tamam',
                  onPress: () => router.back(),
                },
              ]);
            }
          },
        },
      ]
    );
  };

  if (!currentComplaint) {
    return (
      <SafeAreaView style={styles.container}>
        <DataEntryHeader title="Şikayet Düzenle" />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Şikayet bulunamadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isFormValid = description.trim() && selectedSubcategory;
  const isSubmitting = storeSubmitting;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <DataEntryHeader title="Şikayet Düzenle" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Şikayet Açıklaması */}
        <View style={styles.section}>
          <Text style={styles.label}>Şikayet Açıklaması</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Şikayetinizi detaylı bir şekilde açıklayın..."
            placeholderTextColor="#6c757d"
            multiline
            numberOfLines={6}
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{description.length}/1000 karakter</Text>
        </View>

        {/* Kategori Seçimi */}
        <View style={styles.section}>
          <Text style={styles.label}>Kategori</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setCategoryModalVisible(true)}
            disabled={isLoading}>
            <Text style={[styles.selectorText, !selectedCategoryName && styles.placeholderText]}>
              {selectedCategoryName || 'Kategori seçin'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6c757d" />
          </TouchableOpacity>
        </View>

        {/* Alt Kategori Seçimi */}
        <View style={styles.section}>
          <Text style={styles.label}>Alt Kategori</Text>
          <TouchableOpacity
            style={[styles.selector, !selectedCategory && styles.disabledSelector]}
            onPress={() => setSubcategoryModalVisible(true)}
            disabled={!selectedCategory || isLoading}>
            <Text style={[styles.selectorText, !selectedSubcategoryName && styles.placeholderText]}>
              {selectedSubcategoryName || 'Önce kategori seçin'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6c757d" />
          </TouchableOpacity>
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* Update Button */}
          <TouchableOpacity
            style={[styles.saveButton, (!isFormValid || isSubmitting) && styles.disabledButton]}
            onPress={handleUpdate}
            disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Güncelle</Text>
              </>
            )}
          </TouchableOpacity>

          {/* End Complaint Button */}
          {currentComplaint.is_active && (
            <TouchableOpacity
              style={styles.endButton}
              onPress={handleEndComplaint}
              disabled={isSubmitting}>
              <Ionicons name="stop-circle" size={20} color="#fff" />
              <Text style={styles.endButtonText}>Şikayeti Sonlandır</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kategori Seçin</Text>
              <TouchableOpacity
                onPress={() => setCategoryModalVisible(false)}
                style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6c757d" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleCategorySelect(item.id, item.name)}>
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  {item.description && (
                    <Text style={styles.modalItemDescription}>{item.description}</Text>
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Subcategory Selection Modal */}
      <Modal
        visible={subcategoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSubcategoryModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alt Kategori Seçin</Text>
              <TouchableOpacity
                onPress={() => setSubcategoryModalVisible(false)}
                style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6c757d" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={getFilteredSubcategories()}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSubcategorySelect(item.id, item.name)}>
                  <View style={styles.subcategoryHeader}>
                    <Text style={styles.modalItemText}>{item.name}</Text>
                    {item.is_critical && (
                      <View style={styles.criticalBadge}>
                        <Text style={styles.criticalText}>KRİTİK</Text>
                      </View>
                    )}
                  </View>
                  {item.description && (
                    <Text style={styles.modalItemDescription}>{item.description}</Text>
                  )}
                  {item.symptom_hint && (
                    <Text style={styles.symptomHint}>💡 {item.symptom_hint}</Text>
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212529',
    backgroundColor: '#fff',
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
    marginTop: 4,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  disabledSelector: {
    backgroundColor: '#f8f9fa',
    opacity: 0.6,
  },
  selectorText: {
    fontSize: 16,
    color: '#212529',
    flex: 1,
  },
  placeholderText: {
    color: '#6c757d',
  },
  buttonContainer: {
    gap: 12,
    paddingBottom: 24,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  endButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  closeButton: {
    padding: 4,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
  },
  modalItemDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  subcategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  criticalBadge: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  criticalText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  symptomHint: {
    fontSize: 12,
    color: '#007bff',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
