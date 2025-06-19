import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useExerciseStore } from '../../store/exerciseStore';
import { useProfileStore } from '../../store/profileStore';
import { ExercisePlanCard } from '../../components/ExercisePlanCard';

export default function ExercisesScreen() {
  const { profile } = useProfileStore();
  const { exercisePlans, isLoading, error, fetchExercisePlans, startExerciseSession } =
    useExerciseStore();

  useEffect(() => {
    if (profile?.patient_id) {
      fetchExercisePlans(profile.patient_id);
    }
  }, [profile?.patient_id]);

  const handleStartExercise = async () => {
    if (exercisePlans.length === 0) {
      Alert.alert('Hata', 'Hiç egzersiz planı bulunamadı');
      return;
    }

    if (!profile?.patient_id) {
      Alert.alert('Hata', 'Hasta bilgisi bulunamadı');
      return;
    }

    await startExerciseSession(profile.patient_id);
    router.push('/(tabs)/../egzersiz-akisi' as any);
  };

  const handlePlanPress = (plan: any) => {
    router.push(`/(tabs)/../egzersiz-detay?planId=${plan.id}` as any);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4263eb" />
          <Text style={styles.loadingText}>Egzersiz planları yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => profile?.patient_id && fetchExercisePlans(profile.patient_id)}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Egzersiz Planlarım</Text>
          <Text style={styles.subtitle}>{exercisePlans.length} plan mevcut</Text>
        </View>

        {exercisePlans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz egzersiz planınız bulunmuyor</Text>
            <Text style={styles.emptySubtext}>
              Doktorunuz size egzersiz planı atadığında burada görünecektir
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.startButtonContainer}>
              <TouchableOpacity style={styles.mainStartButton} onPress={handleStartExercise}>
                <Text style={styles.mainStartButtonText}>Egzersizi Başlat</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.plansList}>
              {exercisePlans.map((plan) => (
                <ExercisePlanCard key={plan.id} plan={plan} onPress={() => handlePlanPress(plan)} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4263eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  plansList: {
    paddingBottom: 20,
  },
  startButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  mainStartButton: {
    backgroundColor: '#4263eb',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainStartButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
