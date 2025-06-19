import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { ExercisePlan, Exercise, ExercisePlanWithDetails } from '../lib/types/database';

interface ExerciseState {
  // State
  exercisePlans: ExercisePlanWithDetails[];
  currentExercises: ExercisePlanWithDetails[];
  currentExerciseIndex: number;
  isLoading: boolean;
  error: string | null;

  // Egzersiz akışı için state
  isExerciseFlowActive: boolean;
  sessionStartTime: number | null;

  // Actions
  fetchExercisePlans: (patientId: string) => Promise<void>;
  startExerciseSession: (patientId: string) => Promise<void>;
  nextExercise: () => void;
  previousExercise: () => void;
  completeExerciseSession: () => void;
  cancelExerciseSession: () => void;
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  // Initial state
  exercisePlans: [],
  currentExercises: [],
  currentExerciseIndex: 0,
  isLoading: false,
  error: null,
  isExerciseFlowActive: false,
  sessionStartTime: null,

  // Hasta için egzersiz planlarını getir
  fetchExercisePlans: async (patientId: string) => {
    set({ isLoading: true, error: null });

    try {
      // Önce exercise plans'ı çek
      const { data: plans, error: plansError } = await supabase
        .from('exercise_plans')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_deleted', false);

      if (plansError) throw plansError;

      // Her plan için exercise detaylarını çek
      const exercisePlansWithDetails: ExercisePlanWithDetails[] = [];

      for (const plan of plans || []) {
        let exercise = null;
        let difficulty = null;

        if (plan.exercise_id) {
          // Exercise bilgisini çek
          const { data: exerciseData, error: exerciseError } = await supabase
            .from('exercises')
            .select('*')
            .eq('id', plan.exercise_id)
            .eq('is_deleted', false)
            .single();

          if (exerciseData && !exerciseError) {
            exercise = exerciseData;

            // Difficulty bilgisini çek
            if (exerciseData.difficulty_id) {
              const { data: difficultyData, error: difficultyError } = await supabase
                .from('exercise_difficulties')
                .select('*')
                .eq('id', exerciseData.difficulty_id)
                .single();

              if (difficultyData && !difficultyError) {
                difficulty = difficultyData;
              }
            }
          }
        }

        exercisePlansWithDetails.push({
          id: plan.id,
          patient_id: plan.patient_id,
          start_date: plan.start_date,
          end_date: plan.end_date,
          frequency: plan.frequency,
          duration_min: plan.duration_min,
          exercise,
          difficulty,
        });
      }

      set({ exercisePlans: exercisePlansWithDetails, isLoading: false });
    } catch (error) {
      console.error('Egzersiz planları getirilemedi:', error);
      set({ error: 'Egzersiz planları yüklenemedi', isLoading: false });
    }
  },

  // Egzersiz seansını başlat
  startExerciseSession: async (patientId: string) => {
    try {
      // Hasta için tüm egzersiz planlarını yükle
      await get().fetchExercisePlans(patientId);
      const { exercisePlans } = get();

      if (exercisePlans.length === 0) {
        set({ error: 'Egzersiz planı bulunamadı' });
        return;
      }

      set({
        currentExercises: exercisePlans,
        currentExerciseIndex: 0,
        isExerciseFlowActive: true,
        sessionStartTime: Date.now(),
      });
    } catch (error) {
      console.error('Egzersiz seansı başlatılamadı:', error);
      set({ error: 'Egzersiz seansı başlatılamadı' });
    }
  },

  // Sonraki egzersize geç
  nextExercise: () => {
    const { currentExercises, currentExerciseIndex } = get();
    if (currentExerciseIndex < currentExercises.length - 1) {
      set({ currentExerciseIndex: currentExerciseIndex + 1 });
    }
  },

  // Önceki egzersize geç
  previousExercise: () => {
    const { currentExerciseIndex } = get();
    if (currentExerciseIndex > 0) {
      set({ currentExerciseIndex: currentExerciseIndex - 1 });
    }
  },

  // Egzersiz seansını tamamla
  completeExerciseSession: () => {
    set({
      currentExercises: [],
      currentExerciseIndex: 0,
      isExerciseFlowActive: false,
      sessionStartTime: null,
    });
  },

  // Egzersiz seansını iptal et
  cancelExerciseSession: () => {
    set({
      currentExercises: [],
      currentExerciseIndex: 0,
      isExerciseFlowActive: false,
      sessionStartTime: null,
    });
  },
}));
