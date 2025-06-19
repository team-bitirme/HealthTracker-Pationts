import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DataEntryHeader } from '~/components/DataEntryHeader';
import { useProfileStore } from '~/store/profileStore';
import { useMeasurementStore } from '~/store/measurementStore';
import { patientService } from '~/services/patientService';

export default function ElIleGiris() {
  const router = useRouter();
  const { categoryId, categoryTitle, measurementTypeId } = useLocalSearchParams<{
    categoryId: string;
    categoryTitle: string;
    measurementTypeId: string;
  }>();

  const { profile } = useProfileStore();
  const { fetchCategories } = useMeasurementStore();

  const [value, setValue] = useState('');
  const [measuredAt, setMeasuredAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [measurementType, setMeasurementType] = useState<any>(null);

  useEffect(() => {
    loadMeasurementType();
  }, [measurementTypeId]);

  const loadMeasurementType = async () => {
    try {
      const types = await patientService.getMeasurementTypes();
      const type = types.find(t => t.id === parseInt(measurementTypeId));
      setMeasurementType(type);
    } catch (error) {
      console.error('❌ Ölçüm tipi yüklenemedi:', error);
    }
  };

  const handleSave = async () => {
    if (!value.trim()) {
      Alert.alert('Hata', 'Lütfen bir değer girin');
      return;
    }

    const numericValue = parseFloat(value.replace(',', '.'));
    if (isNaN(numericValue)) {
      Alert.alert('Hata', 'Lütfen geçerli bir sayı girin');
      return;
    }

    if (!profile?.patient_id) {
      Alert.alert('Hata', 'Hasta bilgisi bulunamadı');
      return;
    }

    setIsLoading(true);
    try {
      await patientService.saveMeasurement(
        profile.patient_id,
        parseInt(measurementTypeId),
        numericValue,
        'manual',
        measuredAt
      );

      Alert.alert(
        'Başarılı',
        'Ölçüm başarıyla kaydedildi',
        [
          {
            text: 'Tamam',
            onPress: () => {
              // Kategorileri yenile ve geri dön
              if (profile?.patient_id) {
                fetchCategories(profile.patient_id);
              }
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Ölçüm kaydetme hatası:', error);
      Alert.alert('Hata', 'Ölçüm kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(measuredAt);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setMeasuredAt(newDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(measuredAt);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setMeasuredAt(newDate);
    }
  };

  const getInputPlaceholder = () => {
    if (!measurementType) return 'Değer girin';
    
    const placeholders: { [key: string]: string } = {
      'heart_rate': 'Örn: 72',
      'blood_pressure': 'Örn: 120',
      'temperature': 'Örn: 36.5',
      'oxygen_saturation': 'Örn: 98',
      'weight': 'Örn: 70.5',
      'height': 'Örn: 175',
      'blood_sugar': 'Örn: 100'
    };
    
    return placeholders[measurementType.code] || `Değer girin (${measurementType.unit})`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <DataEntryHeader title={`${categoryTitle} - El ile Giriş`} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Değer Girişi */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Değer {measurementType && `(${measurementType.unit})`}
            </Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              placeholder={getInputPlaceholder()}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>

          {/* Tarih Seçimi */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ölçüm Tarihi</Text>
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#007bff" />
              <Text style={styles.dateText}>{formatDate(measuredAt)}</Text>
            </TouchableOpacity>
          </View>

          {/* Saat Seçimi */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ölçüm Saati</Text>
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color="#007bff" />
              <Text style={styles.dateText}>{formatTime(measuredAt)}</Text>
            </TouchableOpacity>
          </View>

          {/* Kaydet Butonu */}
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={isLoading}
          >
            <Ionicons 
              name={isLoading ? "hourglass-outline" : "checkmark-circle-outline"} 
              size={24} 
              color="#fff" 
            />
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={measuredAt}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={measuredAt}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}
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
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#333',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f8f9fa',
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 