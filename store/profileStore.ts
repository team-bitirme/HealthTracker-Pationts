import { create } from 'zustand';
import { PatientProfile, LoadingState } from '../lib/types/database';
import { patientService } from '../services/patientService';

interface ProfileState extends LoadingState {
  profile: PatientProfile | null;
  
  // Actions
  fetchProfile: (authUserId: string) => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  // Initial state
  isLoading: false,
  error: null,
  profile: null,

  // Fetch profile action
  fetchProfile: async (authUserId: string) => {
    console.log('👤 Profil yükleniyor...');
    set({ isLoading: true, error: null });
    
    try {
      const profile = await patientService.getPatientProfile(authUserId);
      
      if (profile) {
        const fullName = `${profile.name || ''} ${profile.surname || ''}`.trim();
        console.log('✅ Profil yüklendi:', fullName || profile.email);
        set({ 
          profile, 
          isLoading: false,
          error: null 
        });
      } else {
        console.log('❌ Profil bulunamadı');
        set({ 
          profile: null, 
          isLoading: false,
          error: 'Profil bilgileri yüklenemedi' 
        });
      }
    } catch (error) {
      console.error('❌ Profil yükleme hatası:', error);
      set({ 
        profile: null, 
        isLoading: false,
        error: 'Profil bilgileri yüklenirken hata oluştu' 
      });
    }
  },

  // Clear profile action
  clearProfile: () => {
    console.log('🗑️ Profil temizlendi');
    set({
      profile: null,
      isLoading: false,
      error: null,
    });
  },
})); 