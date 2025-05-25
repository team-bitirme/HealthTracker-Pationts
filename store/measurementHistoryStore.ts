import { create } from 'zustand';
import { patientService } from '~/services/patientService';

export interface MeasurementRecord {
  id: string;
  value: number | null;
  measured_at: string | null;
  method: string | null;
  created_at: string | null;
  measurement_types: {
    id: number;
    code: string;
    name: string;
    unit: string;
  };
}

export interface MeasurementDetails extends MeasurementRecord {
  updated_at: string | null;
}

interface MeasurementHistoryState {
  measurements: MeasurementRecord[];
  measurementDetails: MeasurementDetails | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchMeasurementHistory: (patientId: string, measurementTypeId: number) => Promise<void>;
  fetchMeasurementDetails: (measurementId: string) => Promise<void>;
  clearMeasurements: () => void;
  clearMeasurementDetails: () => void;
}

export const useMeasurementHistoryStore = create<MeasurementHistoryState>((set, get) => ({
  measurements: [],
  measurementDetails: null,
  isLoading: false,
  error: null,

  fetchMeasurementHistory: async (patientId: string, measurementTypeId: number) => {
    console.log('📊 Ölçüm geçmişi yükleniyor...');
    set({ isLoading: true, error: null });
    
    try {
      const measurements = await patientService.getMeasurementHistory(patientId, measurementTypeId);
      
      console.log(`✅ ${measurements.length} ölçüm kaydı yüklendi`);
      set({ measurements, isLoading: false });
    } catch (error) {
      console.error('❌ Ölçüm geçmişi yükleme hatası:', error);
      set({ 
        error: 'Ölçüm geçmişi yüklenirken hata oluştu', 
        isLoading: false 
      });
    }
  },

  fetchMeasurementDetails: async (measurementId: string) => {
    console.log('📋 Ölçüm detayları yükleniyor...');
    set({ isLoading: true, error: null });
    
    try {
      const measurementDetails = await patientService.getMeasurementDetails(measurementId);
      
      if (measurementDetails) {
        console.log('✅ Ölçüm detayları yüklendi');
        set({ measurementDetails, isLoading: false });
      } else {
        set({ 
          error: 'Ölçüm detayları bulunamadı', 
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('❌ Ölçüm detayları yükleme hatası:', error);
      set({ 
        error: 'Ölçüm detayları yüklenirken hata oluştu', 
        isLoading: false 
      });
    }
  },

  clearMeasurements: () => {
    console.log('🗑️ Ölçüm geçmişi temizlendi');
    set({ measurements: [], error: null });
  },

  clearMeasurementDetails: () => {
    console.log('🗑️ Ölçüm detayları temizlendi');
    set({ measurementDetails: null, error: null });
  },
})); 