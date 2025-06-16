import { create } from 'zustand';
import { supabase } from '~/lib/supabase';

export interface ComplaintCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ComplaintSubcategory {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  symptom_hint: string | null;
  is_critical: boolean | null;
  priority_level: 'low' | 'medium' | 'high' | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Complaint {
  id: string;
  patient_id: string | null;
  description: string | null;
  subcategory_id: string | null;
  is_active: boolean | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_deleted: boolean | null;
  // İlişkili veriler
  subcategory_name?: string;
  category_name?: string;
  is_critical?: boolean | null;
  priority_level?: string | null;
}

export interface CreateComplaintData {
  description: string;
  subcategory_id: string;
  patient_id: string;
}

interface ComplaintsStore {
  // State
  categories: ComplaintCategory[];
  subcategories: ComplaintSubcategory[];
  complaints: Complaint[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  fetchSubcategories: () => Promise<void>;
  fetchComplaints: (patientId: string) => Promise<void>;
  createComplaint: (data: CreateComplaintData) => Promise<boolean>;
  updateComplaint: (complaintId: string, data: Partial<CreateComplaintData>) => Promise<boolean>;
  endComplaint: (complaintId: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

export const useComplaintsStore = create<ComplaintsStore>((set, get) => ({
  // Initial state
  categories: [],
  subcategories: [],
  complaints: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  // Actions
  fetchCategories: async () => {
    set({ isLoading: true, error: null });

    try {
      console.log('📋 Kategoriler yükleniyor...');

      const { data, error } = await supabase
        .from('complaint_categories')
        .select('id, name, description, created_at')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      const categories =
        data?.map((item) => ({
          ...item,
          updated_at: item.created_at, // Fallback
        })) || [];

      console.log('✅ Kategoriler yüklendi:', categories.length);
      set({ categories, isLoading: false });
    } catch (error) {
      console.error('❌ Kategoriler yükleme hatası:', error);
      set({
        error: error instanceof Error ? error.message : 'Kategoriler yüklenirken hata oluştu',
        isLoading: false,
      });
    }
  },

  fetchSubcategories: async () => {
    set({ isLoading: true, error: null });

    try {
      console.log('📋 Alt kategoriler yükleniyor...');

      const { data, error } = await supabase
        .from('complaint_subcategories')
        .select(
          `
          id,
          category_id,
          name,
          description,
          symptom_hint,
          is_critical,
          priority_level,
          created_at,
          complaint_categories!inner(name)
        `
        )
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      const subcategories =
        data?.map((item) => ({
          ...item,
          updated_at: item.created_at, // Fallback
        })) || [];

      console.log('✅ Alt kategoriler yüklendi:', subcategories.length);
      set({ subcategories, isLoading: false });
    } catch (error) {
      console.error('❌ Alt kategoriler yükleme hatası:', error);
      set({
        error: error instanceof Error ? error.message : 'Alt kategoriler yüklenirken hata oluştu',
        isLoading: false,
      });
    }
  },

  fetchComplaints: async (patientId: string) => {
    set({ isLoading: true, error: null });

    try {
      console.log('📋 Şikayetler yükleniyor...', patientId);

      const { data, error } = await supabase
        .from('complaints')
        .select(
          `
          id,
          patient_id,
          description,
          subcategory_id,
          is_active,
          start_date,
          end_date,
          created_at,
          updated_at,
          is_deleted,
          complaint_subcategories!inner(
            name,
            is_critical,
            priority_level,
            complaint_categories!inner(name)
          )
        `
        )
        .eq('patient_id', patientId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const complaints =
        data?.map((item) => ({
          ...item,
          subcategory_name: item.complaint_subcategories?.name,
          category_name: item.complaint_subcategories?.complaint_categories?.name,
          is_critical: item.complaint_subcategories?.is_critical,
          priority_level: item.complaint_subcategories?.priority_level,
        })) || [];

      console.log('✅ Şikayetler yüklendi:', complaints.length);
      set({ complaints, isLoading: false });
    } catch (error) {
      console.error('❌ Şikayetler yükleme hatası:', error);
      set({
        error: error instanceof Error ? error.message : 'Şikayetler yüklenirken hata oluştu',
        isLoading: false,
      });
    }
  },

  createComplaint: async (data: CreateComplaintData) => {
    set({ isSubmitting: true, error: null });

    try {
      console.log('💾 Yeni şikayet kaydediliyor...', data);

      // Current date for start_date
      const startDate = new Date().toISOString().split('T')[0];

      const { data: newComplaint, error } = await supabase
        .from('complaints')
        .insert({
          patient_id: data.patient_id,
          description: data.description.trim(),
          subcategory_id: data.subcategory_id,
          is_active: true,
          start_date: startDate,
          end_date: null,
          is_deleted: false,
        })
        .select('id, created_at')
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ Şikayet başarıyla kaydedildi:', newComplaint.id);

      // Şikayetleri yeniden yükle
      await get().fetchComplaints(data.patient_id);

      set({ isSubmitting: false });
      return true;
    } catch (error) {
      console.error('❌ Şikayet kaydetme hatası:', error);
      set({
        error: error instanceof Error ? error.message : 'Şikayet kaydedilirken hata oluştu',
        isSubmitting: false,
      });
      return false;
    }
  },

  updateComplaint: async (complaintId: string, data: Partial<CreateComplaintData>) => {
    set({ isSubmitting: true, error: null });

    try {
      console.log('💾 Şikayet güncelleniyor...', complaintId, data);

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (data.description) {
        updateData.description = data.description.trim();
      }
      if (data.subcategory_id) {
        updateData.subcategory_id = data.subcategory_id;
      }

      const { error } = await supabase.from('complaints').update(updateData).eq('id', complaintId);

      if (error) {
        throw error;
      }

      console.log('✅ Şikayet başarıyla güncellendi');

      // Şikayetleri yeniden yükle
      if (data.patient_id) {
        await get().fetchComplaints(data.patient_id);
      }

      set({ isSubmitting: false });
      return true;
    } catch (error) {
      console.error('❌ Şikayet güncelleme hatası:', error);
      set({
        error: error instanceof Error ? error.message : 'Şikayet güncellenirken hata oluştu',
        isSubmitting: false,
      });
      return false;
    }
  },

  endComplaint: async (complaintId: string) => {
    set({ isSubmitting: true, error: null });

    try {
      console.log('🔚 Şikayet sonlandırılıyor...', complaintId);

      const endDate = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('complaints')
        .update({
          is_active: false,
          end_date: endDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', complaintId);

      if (error) {
        throw error;
      }

      console.log('✅ Şikayet başarıyla sonlandırıldı');

      set({ isSubmitting: false });
      return true;
    } catch (error) {
      console.error('❌ Şikayet sonlandırma hatası:', error);
      set({
        error: error instanceof Error ? error.message : 'Şikayet sonlandırılırken hata oluştu',
        isSubmitting: false,
      });
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      categories: [],
      subcategories: [],
      complaints: [],
      isLoading: false,
      isSubmitting: false,
      error: null,
    });
  },
}));
