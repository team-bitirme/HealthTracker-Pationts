import { create } from 'zustand';
import { DataCategory } from '~/components/DataCategoryList';
import { patientService } from '~/services/patientService';

interface MeasurementState {
  categories: DataCategory[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: (patientId: string) => Promise<void>;
  clearCategories: () => void;
}

export const useMeasurementStore = create<MeasurementState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async (patientId: string) => {
    console.log('📂 Kategoriler yükleniyor...');
    set({ isLoading: true, error: null });
    
    try {
      const categories = await patientService.createDataCategoriesFromMeasurementTypes(patientId);
      
      console.log(`✅ ${categories.length} kategori yüklendi`);
      set({ categories, isLoading: false });
    } catch (error) {
      console.error('❌ Kategori yükleme hatası:', error);
      set({ 
        error: 'Veri kategorileri yüklenirken hata oluştu', 
        isLoading: false 
      });
    }
  },

  clearCategories: () => {
    console.log('🗑️ Kategoriler temizlendi');
    set({ categories: [], error: null });
  },
})); 