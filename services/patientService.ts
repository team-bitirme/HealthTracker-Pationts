import { supabase } from '../lib/supabase';
import { PatientProfile } from '../lib/types/database';

export class PatientService {
  /**
   * Get patient profile by auth user ID
   */
  async getPatientProfile(authUserId: string): Promise<PatientProfile | null> {
    console.log('👤 Hasta profili getiriliyor...');
    
    try {
      // Get the user from users table using auth user_id (which is the id field)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .single();

      if (userError) {
        console.error('❌ Kullanıcı bulunamadı:', userError.message);
        return null;
      }

      if (!userData) {
        console.error('❌ Kullanıcı verisi yok');
        return null;
      }

      console.log('✅ Kullanıcı bulundu:', userData.email);

      // Get patient profile if exists with gender info
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select(`
          *,
          genders (
            id,
            code,
            name
          )
        `)
        .eq('user_id', userData.id)
        .single();

      if (patientError && patientError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Hasta verisi alınamadı:', patientError.message);
      }

      if (patientData) {
        console.log('✅ Hasta profili bulundu:', `${patientData.name} ${patientData.surname}`);
      } else {
        console.log('ℹ️ Hasta profili bulunamadı');
      }

      // Get doctor info if patient exists
      let doctorData = null;
      if (patientData?.id) {
        console.log('👨‍⚕️ Doktor bilgisi getiriliyor...');
        
        const { data: doctorPatientData, error: doctorError } = await supabase
          .from('doctor_patients')
          .select(`
            doctor_id,
            doctors!inner (
              id,
              name,
              surname,
              specialization_id,
              specializations (
                id,
                name
              )
            )
          `)
          .eq('patient_id', patientData.id)
          .eq('is_deleted', false)
          .single();

        if (doctorError && doctorError.code !== 'PGRST116') {
          console.error('❌ Doktor verisi alınamadı:', doctorError.message);
        }

        if (doctorPatientData?.doctors) {
          doctorData = doctorPatientData.doctors;
          console.log('✅ Doktor bilgisi bulundu:', `Dr. ${doctorData.name} ${doctorData.surname}`);
        } else {
          console.log('ℹ️ Doktor ataması bulunamadı');
        }
      }

      // Combine user, patient and doctor data
      const profile: PatientProfile = {
        id: userData.id,
        email: userData.email,
        role_id: userData.role_id,
        created_at: userData.created_at,
        patient_id: patientData?.id ?? null,
        name: patientData?.name ?? null,
        surname: patientData?.surname ?? null,
        birth_date: patientData?.birth_date ?? null,
        gender_id: patientData?.gender_id ?? null,
        gender_name: patientData?.genders?.name ?? null,
        patient_note: patientData?.patient_note ?? null,
        doctor_id: doctorData?.id ?? null,
        doctor_name: doctorData?.name ?? null,
        doctor_surname: doctorData?.surname ?? null,
        doctor_specialization: doctorData?.specializations?.name ?? null,
      };

      return profile;
    } catch (error) {
      console.error('❌ Profil getirme hatası:', error);
      return null;
    }
  }

  /**
   * Calculate age from birth date
   */
  calculateAge(birthDate: string | null): number | null {
    if (!birthDate) return null;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Calculate BMI
   */
  calculateBMI(weight: number | null, height: number | null): number | null {
    if (!weight || !height) return null;
    
    const heightInM = height / 100;
    return weight / (heightInM * heightInM);
  }

  /**
   * Get BMI category
   */
  getBMICategory(bmi: number | null): string | null {
    if (!bmi) return null;
    
    if (bmi < 18.5) return 'Zayıf';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Fazla Kilo';
    return 'Obez';
  }

  /**
   * Format gender for display
   */
  formatGender(genderName?: string | null): string {
    return genderName || 'Belirtilmemiş';
  }

  /**
   * Get latest health measurements for a patient
   */
  async getLatestHealthMeasurements(patientId: string) {
    console.log('📊 Sağlık ölçümleri getiriliyor...');
    
    try {
      const { data, error } = await supabase
        .from('health_measurements')
        .select(`
          *,
          measurement_types (
            id,
            code,
            name,
            unit
          )
        `)
        .eq('patient_id', patientId)
        .eq('is_deleted', false)
        .order('measured_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Ölçüm verisi alınamadı:', error.message);
        return [];
      }

      console.log(`✅ ${data?.length || 0} ölçüm bulundu`);
      return data || [];
    } catch (error) {
      console.error('❌ Ölçüm getirme hatası:', error);
      return [];
    }
  }

  /**
   * Get active complaints for a patient
   */
  async getActiveComplaints(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error in getActiveComplaints:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveComplaints:', error);
      return [];
    }
  }

  /**
   * Get latest measurement by type code for dashboard
   */
  async getLatestMeasurementByType(patientId: string, typeCode: string): Promise<number | null> {
    console.log(`🔍 PatientService: Getting latest ${typeCode} measurement for patient:`, patientId);
    
    try {
      const { data, error } = await supabase
        .from('health_measurements')
        .select(`
          value,
          measurement_types!inner (
            code
          )
        `)
        .eq('patient_id', patientId)
        .eq('measurement_types.code', typeCode)
        .eq('is_deleted', false)
        .order('measured_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error(`❌ PatientService: Error fetching ${typeCode} measurement:`, error);
        return null;
      }

      const value = data?.value || null;
      console.log(`✅ PatientService: Latest ${typeCode} value:`, value);
      return value;
    } catch (error) {
      console.error(`❌ PatientService: Error in getLatestMeasurementByType for ${typeCode}:`, error);
      return null;
    }
  }

  /**
   * Get latest measurement with ID by type code for dashboard
   */
  async getLatestMeasurementWithIdByType(patientId: string, typeCode: string): Promise<{ value: number; id: string } | null> {
    console.log(`🔍 PatientService: Getting latest ${typeCode} measurement with ID for patient:`, patientId);
    
    try {
      const { data, error } = await supabase
        .from('health_measurements')
        .select(`
          id,
          value,
          measurement_types!inner (
            code
          )
        `)
        .eq('patient_id', patientId)
        .eq('measurement_types.code', typeCode)
        .eq('is_deleted', false)
        .order('measured_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error(`❌ PatientService: Error fetching ${typeCode} measurement with ID:`, error);
        return null;
      }

      const result = {
        value: data?.value || 0,
        id: data?.id || ''
      };
      
      console.log(`✅ PatientService: Latest ${typeCode} measurement with ID:`, result);
      return result;
    } catch (error) {
      console.error(`❌ PatientService: Error in getLatestMeasurementWithIdByType for ${typeCode}:`, error);
      return null;
    }
  }

  /**
   * Get multiple latest measurements with IDs for dashboard
   */
  async getLatestMeasurementsWithIdsForDashboard(patientId: string) {
    console.log('🔍 PatientService: Getting latest measurements with IDs for dashboard, patient:', patientId);
    
    try {
      const measurementTypes = ['heart_rate', 'blood_pressure', 'oxygen_saturation', 'temperature'];
      const measurements: { [key: string]: { value: number; id: string } | null } = {};

      for (const type of measurementTypes) {
        measurements[type] = await this.getLatestMeasurementWithIdByType(patientId, type);
      }

      console.log('✅ PatientService: Dashboard measurements with IDs fetched:', measurements);
      return measurements;
    } catch (error) {
      console.error('❌ PatientService: Error in getLatestMeasurementsWithIdsForDashboard:', error);
      return {};
    }
  }

  /**
   * Get all measurement types from database
   */
  async getMeasurementTypes() {
    console.log('🔍 PatientService: Getting all measurement types from database...');
    
    try {
      const { data, error } = await supabase
        .from('measurement_types')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ PatientService: Error fetching measurement types:', error);
        return [];
      }

      console.log('✅ PatientService: Measurement types fetched:', data?.length || 0, 'types');
      console.log('📊 PatientService: Measurement types:', data?.map(t => ({ id: t.id, code: t.code, name: t.name })));
      return data || [];
    } catch (error) {
      console.error('❌ PatientService: Error in getMeasurementTypes:', error);
      return [];
    }
  }

  /**
   * Get latest measurement value for a specific measurement type
   */
  async getLatestMeasurementValue(patientId: string, measurementTypeId: number): Promise<{ value: number; unit: string } | null> {
    console.log(`🔍 PatientService: Getting latest measurement value for patient ${patientId}, type ${measurementTypeId}`);
    
    try {
      const { data, error } = await supabase
        .from('health_measurements')
        .select(`
          value,
          measurement_types!inner (
            unit
          )
        `)
        .eq('patient_id', patientId)
        .eq('measurement_type_id', measurementTypeId)
        .eq('is_deleted', false)
        .order('measured_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error(`❌ PatientService: Error fetching latest measurement for type ${measurementTypeId}:`, error);
        return null;
      }

      const result = {
        value: data.value || 0,
        unit: data.measurement_types.unit
      };
      
      console.log(`✅ PatientService: Latest measurement for type ${measurementTypeId}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ PatientService: Error in getLatestMeasurementValue for type ${measurementTypeId}:`, error);
      return null;
    }
  }

  /**
   * Create data categories from measurement types with latest values
   */
  async createDataCategoriesFromMeasurementTypes(patientId: string) {
    console.log('🔍 PatientService: Creating data categories from measurement types for patient:', patientId);
    
    try {
      const measurementTypes = await this.getMeasurementTypes();
      const categories = [];

      console.log('📊 PatientService: Processing', measurementTypes.length, 'measurement types...');

      for (const type of measurementTypes) {
        console.log(`🔍 PatientService: Processing measurement type: ${type.name} (${type.code})`);
        
        const latestValue = await this.getLatestMeasurementValue(patientId, type.id);
        const iconName = this.getIconForMeasurementType(type.code);
        
        const category = {
          id: type.code,
          title: type.name,
          iconName: iconName,
          latestValue: latestValue ? `${latestValue.value} ${latestValue.unit}` : 'Veri yok',
          measurementTypeId: type.id,
          unit: type.unit
        };
        
        console.log(`✅ PatientService: Created category for ${type.name}:`, {
          id: category.id,
          title: category.title,
          iconName: category.iconName,
          latestValue: category.latestValue
        });
        
        categories.push(category);
      }

      console.log('✅ PatientService: Data categories created successfully:', categories.length, 'categories');
      return categories;
    } catch (error) {
      console.error('❌ PatientService: Error in createDataCategoriesFromMeasurementTypes:', error);
      return [];
    }
  }

  /**
   * Get appropriate icon for measurement type
   */
  private getIconForMeasurementType(code: string): string {
    const iconMap: { [key: string]: string } = {
      'heart_rate': 'heart',
      'blood_pressure': 'line-chart',
      'temperature': 'thermometer-quarter',
      'oxygen_saturation': 'heartbeat',
      'respiratory_rate': 'user-md',
      'blood_sugar': 'tint',
      'weight': 'balance-scale',
      'height': 'arrows-v',
      'bmi': 'calculator',
      'pulse': 'heart',
      'blood_glucose': 'tint',
      'cholesterol': 'flask',
      'blood_oxygen': 'heartbeat'
    };

    const selectedIcon = iconMap[code] || 'stethoscope';
    console.log(`🎨 PatientService: Icon selected for ${code}:`, selectedIcon);
    return selectedIcon;
  }

  /**
   * Get measurement history for a specific measurement type
   */
  async getMeasurementHistory(patientId: string, measurementTypeId: number, limit: number = 50) {
    console.log(`🔍 PatientService: Getting measurement history for patient ${patientId}, type ${measurementTypeId}`);
    
    try {
      const { data, error } = await supabase
        .from('health_measurements')
        .select(`
          id,
          value,
          measured_at,
          method,
          created_at,
          measurement_types!inner (
            id,
            code,
            name,
            unit
          )
        `)
        .eq('patient_id', patientId)
        .eq('measurement_type_id', measurementTypeId)
        .eq('is_deleted', false)
        .order('measured_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error(`❌ PatientService: Error fetching measurement history for type ${measurementTypeId}:`, error);
        return [];
      }

      console.log(`✅ PatientService: Measurement history fetched: ${data?.length || 0} records`);
      return data || [];
    } catch (error) {
      console.error(`❌ PatientService: Error in getMeasurementHistory for type ${measurementTypeId}:`, error);
      return [];
    }
  }

  /**
   * Get single measurement details by ID
   */
  async getMeasurementDetails(measurementId: string) {
    console.log(`🔍 PatientService: Getting measurement details for ID ${measurementId}`);
    
    try {
      const { data, error } = await supabase
        .from('health_measurements')
        .select(`
          id,
          value,
          measured_at,
          method,
          created_at,
          updated_at,
          measurement_types!inner (
            id,
            code,
            name,
            unit
          )
        `)
        .eq('id', measurementId)
        .eq('is_deleted', false)
        .single();

      if (error) {
        console.error(`❌ PatientService: Error fetching measurement details for ID ${measurementId}:`, error);
        return null;
      }

      console.log(`✅ PatientService: Measurement details fetched for ID ${measurementId}`);
      return data;
    } catch (error) {
      console.error(`❌ PatientService: Error in getMeasurementDetails for ID ${measurementId}:`, error);
      return null;
    }
  }

  /**
   * Save a new health measurement
   */
  async saveMeasurement(
    patientId: string, 
    measurementTypeId: number, 
    value: number, 
    method: string = 'manual',
    measuredAt?: Date
  ) {
    console.log(`💾 PatientService: Saving measurement for patient ${patientId}, type ${measurementTypeId}, value ${value}`);
    
    try {
      const measurementData = {
        patient_id: patientId,
        measurement_type_id: measurementTypeId,
        value: value,
        method: method,
        measured_at: measuredAt ? measuredAt.toISOString() : new Date().toISOString(),
        is_deleted: false
      };

      const { data, error } = await supabase
        .from('health_measurements')
        .insert(measurementData)
        .select(`
          id,
          value,
          measured_at,
          method,
          created_at,
          measurement_types!inner (
            id,
            code,
            name,
            unit
          )
        `)
        .single();

      if (error) {
        console.error('❌ PatientService: Error saving measurement:', error);
        throw new Error(`Ölçüm kaydedilemedi: ${error.message}`);
      }

      console.log('✅ PatientService: Measurement saved successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ PatientService: Error in saveMeasurement:', error);
      throw error;
    }
  }
}

export const patientService = new PatientService(); 