export interface User {
  id: string;
  email: string;
  role_id: number | null;
  created_at: string | null;
  updated_at: string | null;
  is_deleted: boolean | null;
}

export interface Patient {
  id: string;
  user_id: string | null;
  name: string | null;
  surname: string | null;
  birth_date: string | null;
  gender_id: number | null;
  patient_note: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_deleted: boolean | null;
}

export interface Gender {
  id: number;
  code: string;
  name: string;
}

export interface Doctor {
  id: string;
  name: string | null;
  surname: string | null;
  specialization_id: number | null;
  specialization_name?: string | null;
}

export interface FCMToken {
  id: string;
  user_id: string | null;
  token: string;
  platform: string | null;
  device_info: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PatientProfile {
  // User info
  id: string;
  email: string;
  role_id: number | null;
  created_at: string | null;

  // Patient specific info
  patient_id: string | null;
  name: string | null;
  surname: string | null;
  birth_date: string | null;
  gender_id: number | null;
  gender_name: string | null;
  patient_note: string | null;

  // Doctor info
  doctor_id: string | null;
  doctor_name: string | null;
  doctor_surname: string | null;
  doctor_specialization: string | null;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface ExercisePlan {
  id: string;
  patient_id: string | null;
  exercise_id: string | null;
  start_date: string | null;
  end_date: string | null;
  frequency: string | null;
  duration_min: number | null;
  created_at: string | null;
  updated_at: string | null;
  is_deleted: boolean | null;
}

export interface Exercise {
  id: string;
  name: string | null;
  description: string | null;
  difficulty_id: number | null;
  created_at: string | null;
  updated_at: string | null;
  is_deleted: boolean | null;
}

export interface ExerciseDifficulty {
  id: number;
  code: string;
  name: string;
}

// Egzersiz planı ile egzersiz bilgilerinin birleştirilmiş hali
export interface ExercisePlanWithDetails {
  id: string;
  patient_id: string | null;
  start_date: string | null;
  end_date: string | null;
  frequency: string | null;
  duration_min: number | null;
  exercise: Exercise | null;
  difficulty: ExerciseDifficulty | null;
}
