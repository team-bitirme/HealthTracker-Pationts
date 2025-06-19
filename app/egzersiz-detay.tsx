import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useExerciseStore } from '../store/exerciseStore';
import { Ionicons } from '@expo/vector-icons';

export default function ExerciseDetailScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { exercisePlans, startExerciseSession } = useExerciseStore();

  const plan = exercisePlans.find((p) => p.id === planId);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return '#28a745';
      case 'medium':
        return '#ffc107';
      case 'hard':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getDifficultyText = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'Kolay';
      case 'medium':
        return 'Orta';
      case 'hard':
        return 'Zor';
      default:
        return 'Belirsiz';
    }
  };

  const handleStartExercise = async () => {
    if (!plan?.patient_id) {
      Alert.alert('Hata', 'Hasta bilgisi bulunamadı');
      return;
    }

    await startExerciseSession(plan.patient_id);
    router.push('/egzersiz-akisi' as any);
  };

  if (!plan) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Egzersiz planı bulunamadı</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#4263eb" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Egzersiz Detayı</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Exercise Info */}
        <View style={styles.exerciseCard}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseName}>{plan.exercise?.name || 'İsimsiz Egzersiz'}</Text>
            {plan.difficulty && (
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(plan.difficulty.code) },
                ]}>
                <Text style={styles.difficultyText}>{getDifficultyText(plan.difficulty.code)}</Text>
              </View>
            )}
          </View>

          {plan.exercise?.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Açıklama</Text>
              <Text style={styles.description}>{plan.exercise.description}</Text>
            </View>
          )}

          {/* Plan Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plan Detayları</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={20} color="#4263eb" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Süre</Text>
                  <Text style={styles.detailValue}>
                    {plan.duration_min ? `${plan.duration_min} dakika` : 'Belirsiz'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="repeat-outline" size={20} color="#4263eb" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Sıklık</Text>
                  <Text style={styles.detailValue}>{plan.frequency || 'Belirsiz'}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={20} color="#4263eb" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Başlangıç</Text>
                  <Text style={styles.detailValue}>{formatDate(plan.start_date)}</Text>
                </View>
              </View>

              {plan.end_date && (
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={20} color="#4263eb" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Bitiş</Text>
                    <Text style={styles.detailValue}>{formatDate(plan.end_date)}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Exercise Illustration Placeholder */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Egzersiz Görseli</Text>
            <View style={styles.exerciseIllustration}>
              <Ionicons name="image-outline" size={48} color="#adb5bd" />
              <Text style={styles.illustrationText}>Egzersiz görseli mevcut değil</Text>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartExercise}>
            <Ionicons name="play" size={20} color="white" />
            <Text style={styles.startButtonText}>Egzersizi Başlat</Text>
          </TouchableOpacity>
        </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backIconButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  placeholder: {
    width: 40,
  },
  exerciseCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  exerciseName: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginRight: 16,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 24,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '600',
    marginTop: 2,
  },
  exerciseIllustration: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  illustrationText: {
    fontSize: 14,
    color: '#adb5bd',
    marginTop: 8,
    textAlign: 'center',
  },
  actionContainer: {
    padding: 16,
  },
  startButton: {
    backgroundColor: '#4263eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4263eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
