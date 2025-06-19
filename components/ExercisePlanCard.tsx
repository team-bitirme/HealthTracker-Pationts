import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { ExercisePlanWithDetails } from '../lib/types/database';

interface ExercisePlanCardProps {
  plan: ExercisePlanWithDetails;
  onPress: () => void;
}

export function ExercisePlanCard({ plan, onPress }: ExercisePlanCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
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

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <Text style={styles.exerciseName} numberOfLines={2}>
            {plan.exercise?.name || 'İsimsiz Egzersiz'}
          </Text>
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

        {/* {plan.exercise?.description && (
          <Text style={styles.description} numberOfLines={3}>
            {plan.exercise.description}
          </Text>
        )} */}

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Süre:</Text>
            <Text style={styles.detailValue}>
              {plan.duration_min ? `${plan.duration_min} dakika` : 'Belirsiz'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sıklık:</Text>
            <Text style={styles.detailValue}>{plan.frequency || 'Belirsiz'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Başlangıç:</Text>
            <Text style={styles.detailValue}>{formatDate(plan.start_date)}</Text>
          </View>

          {plan.end_date && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bitiş:</Text>
              <Text style={styles.detailValue}>{formatDate(plan.end_date)}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginRight: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 16,
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#4263eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
