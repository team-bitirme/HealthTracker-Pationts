import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MeasurementRecord } from '~/store/measurementHistoryStore';

interface MeasurementListItemProps {
  measurement: MeasurementRecord;
  onPress: (measurement: MeasurementRecord) => void;
}

export function MeasurementListItem({ measurement, onPress }: MeasurementListItemProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Tarih belirtilmemiş';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };

  const formatValue = (value: number | null, unit: string) => {
    if (value === null || value === undefined) return 'Değer yok';
    return `${value} ${unit}`;
  };

  const getMethodText = (method: string | null) => {
    if (!method) return 'Yöntem belirtilmemiş';
    
    const methodMap: { [key: string]: string } = {
      'manual': 'El ile giriş',
      'photo': 'Fotoğraf ile',
      'device': 'Cihaz ile',
      'automatic': 'Otomatik'
    };
    
    return methodMap[method] || method;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(measurement)} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.mainInfo}>
          <Text style={styles.value}>
            {formatValue(measurement.value, measurement.measurement_types.unit)}
          </Text>
          <Text style={styles.date}>
            {formatDate(measurement.measured_at)}
          </Text>
        </View>
        
        <View style={styles.secondaryInfo}>
          <View style={styles.methodContainer}>
            <Ionicons 
              name={measurement.method === 'manual' ? 'create-outline' : 'camera-outline'} 
              size={16} 
              color="#6c757d" 
            />
            <Text style={styles.method}>
              {getMethodText(measurement.method)}
            </Text>
          </View>
        </View>
        
        <View style={styles.arrow}>
          <Ionicons name="chevron-forward" size={20} color="#adb5bd" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  mainInfo: {
    flex: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  secondaryInfo: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  method: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 4,
  },
  arrow: {
    marginLeft: 8,
  },
}); 