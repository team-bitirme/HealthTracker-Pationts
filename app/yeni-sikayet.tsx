import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DataEntryHeader } from '~/components/DataEntryHeader';
import {
  useComplaintsStore,
  ComplaintCategory,
  ComplaintSubcategory,
} from '~/store/complaintsStore';
import { useProfileStore } from '~/store/profileStore';

export default function YeniSikayet() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const {
    categories,
    subcategories,
    isLoading: storeLoading,
    isSubmitting,
    error: storeError,
    fetchCategories,
    fetchSubcategories,
    createComplaint,
    clearError,
  } = useComplaintsStore();

  // Form states
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ComplaintSubcategory | null>(null);

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchCategories(), fetchSubcategories()]);
      } catch (error) {
        console.error('❌ Veri yükleme hatası:', error);
      }
    };

    loadData();
  }, []);

  // Clear store error when component mounts
  useEffect(() => {
    clearError();
  }, []);

  const getFilteredSubcategories = () => {
    if (!selectedCategory) return [];
    return subcategories.filter((sub) => sub.category_id === selectedCategory.id);
  };

  const handleCategorySelect = (category: ComplaintCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setShowCategoryModal(false);
  };

  const handleSubcategorySelect = (subcategory: ComplaintSubcategory) => {
    setSelectedSubcategory(subcategory);
    setShowSubcategoryModal(false);
  };

  const handleSave = async () => {
    // Validation
    if (!description.trim()) {
      Alert.alert('Uyarı', 'Lütfen şikayet açıklamasını girin.');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Uyarı', 'Lütfen bir kategori seçin.');
      return;
    }

    if (!selectedSubcategory) {
      Alert.alert('Uyarı', 'Lütfen bir alt kategori seçin.');
      return;
    }

    if (!profile?.patient_id) {
      Alert.alert('Hata', 'Kullanıcı bilgileri bulunamadı.');
      return;
    }

    try {
      const success = await createComplaint({
        description: description.trim(),
        subcategory_id: selectedSubcategory.id,
        patient_id: profile.patient_id,
      });

      if (success) {
        Alert.alert('Başarılı', 'Şikayetiniz başarıyla kaydedildi.', [
          {
            text: 'Tamam',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error) {
      console.error('❌ Şikayet kaydetme hatası:', error);
    }
  };

  const renderCategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCategoryModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kategori Seçin</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryModal(false)}
              style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalList}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.modalItem,
                  selectedCategory?.id === category.id && styles.modalItemSelected,
                ]}
                onPress={() => handleCategorySelect(category)}>
                <Text
                  style={[
                    styles.modalItemTitle,
                    selectedCategory?.id === category.id && styles.modalItemTitleSelected,
                  ]}>
                  {category.name}
                </Text>
                {category.description && (
                  <Text style={styles.modalItemDescription}>{category.description}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderSubcategoryModal = () => (
    <Modal
      visible={showSubcategoryModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSubcategoryModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Alt Kategori Seçin</Text>
            <TouchableOpacity
              onPress={() => setShowSubcategoryModal(false)}
              style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalList}>
            {getFilteredSubcategories().map((subcategory) => (
              <TouchableOpacity
                key={subcategory.id}
                style={[
                  styles.modalItem,
                  selectedSubcategory?.id === subcategory.id && styles.modalItemSelected,
                ]}
                onPress={() => handleSubcategorySelect(subcategory)}>
                <View style={styles.subcategoryHeader}>
                  <Text
                    style={[
                      styles.modalItemTitle,
                      selectedSubcategory?.id === subcategory.id && styles.modalItemTitleSelected,
                    ]}>
                    {subcategory.name}
                  </Text>
                  {subcategory.is_critical && (
                    <FontAwesome name="exclamation-triangle" size={16} color="#dc3545" />
                  )}
                </View>
                {subcategory.description && (
                  <Text style={styles.modalItemDescription}>{subcategory.description}</Text>
                )}
                {subcategory.symptom_hint && (
                  <Text style={styles.symptomHint}>Örnek: "{subcategory.symptom_hint}"</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Loading state while fetching data
  if (storeLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <DataEntryHeader title="Yeni Şikayet" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <DataEntryHeader title="Yeni Şikayet" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Error Display */}
          {storeError && (
            <View style={styles.errorContainer}>
              <FontAwesome name="exclamation-triangle" size={16} color="#dc3545" />
              <Text style={styles.errorText}>{storeError}</Text>
              <TouchableOpacity onPress={clearError} style={styles.errorClose}>
                <Ionicons name="close" size={16} color="#dc3545" />
              </TouchableOpacity>
            </View>
          )}

          {/* Açıklama */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şikayet Açıklaması *</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Şikayetinizi detaylı bir şekilde açıklayın..."
              placeholderTextColor="#6c757d"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.charCount}>{description.length}/1000</Text>
          </View>

          {/* Kategori Seçimi */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kategori *</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowCategoryModal(true)}
              disabled={categories.length === 0}>
              <Text style={[styles.dropdownText, !selectedCategory && styles.dropdownPlaceholder]}>
                {selectedCategory
                  ? selectedCategory.name
                  : categories.length === 0
                    ? 'Kategoriler yükleniyor...'
                    : 'Kategori seçin'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Alt Kategori Seçimi */}
          {selectedCategory && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Alt Kategori *</Text>
              <TouchableOpacity
                style={[
                  styles.dropdown,
                  getFilteredSubcategories().length === 0 && styles.dropdownDisabled,
                ]}
                onPress={() => {
                  if (getFilteredSubcategories().length > 0) {
                    setShowSubcategoryModal(true);
                  }
                }}
                disabled={getFilteredSubcategories().length === 0}>
                <Text
                  style={[styles.dropdownText, !selectedSubcategory && styles.dropdownPlaceholder]}>
                  {selectedSubcategory
                    ? selectedSubcategory.name
                    : getFilteredSubcategories().length === 0
                      ? 'Bu kategori için alt kategori yok'
                      : 'Alt kategori seçin'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              {selectedSubcategory && (
                <View style={styles.subcategoryInfo}>
                  {selectedSubcategory.description && (
                    <Text style={styles.subcategoryDescription}>
                      {selectedSubcategory.description}
                    </Text>
                  )}
                  {selectedSubcategory.is_critical && (
                    <View style={styles.criticalWarning}>
                      <FontAwesome name="exclamation-triangle" size={16} color="#dc3545" />
                      <Text style={styles.criticalText}>
                        Bu şikayet kritik olarak işaretlenmiştir
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Kaydet Butonu */}
          <TouchableOpacity
            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSubmitting}>
            <Ionicons
              name={isSubmitting ? 'hourglass-outline' : 'checkmark-circle-outline'}
              size={24}
              color="#fff"
            />
            <Text style={styles.saveButtonText}>{isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      {renderCategoryModal()}
      {renderSubcategoryModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 12,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#721c24',
    marginLeft: 8,
  },
  errorClose: {
    padding: 4,
  },
  inputGroup: {
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212529',
    backgroundColor: '#f8f9fa',
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
    marginTop: 4,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
  },
  dropdownDisabled: {
    backgroundColor: '#e9ecef',
    opacity: 0.6,
  },
  dropdownText: {
    fontSize: 16,
    color: '#212529',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#6c757d',
  },
  subcategoryInfo: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
  },
  subcategoryDescription: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
  },
  criticalWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#dc3545',
  },
  criticalText: {
    fontSize: 12,
    color: '#721c24',
    marginLeft: 8,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Modal Styles
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  modalItemSelected: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
  },
  modalItemTitleSelected: {
    color: '#007bff',
    fontWeight: '600',
  },
  modalItemDescription: {
    fontSize: 14,
    color: '#6c757d',
  },
  subcategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  symptomHint: {
    fontSize: 12,
    color: '#6f42c1',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
