import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useExerciseStore } from '../store/exerciseStore';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ExerciseFlowScreen() {
  const {
    currentExercises,
    currentExerciseIndex,
    isExerciseFlowActive,
    sessionStartTime,
    nextExercise,
    previousExercise,
    completeExerciseSession,
    cancelExerciseSession,
  } = useExerciseStore();

  const [elapsedTime, setElapsedTime] = useState(0);

  const currentExercise = currentExercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === currentExercises.length - 1;
  const isFirstExercise = currentExerciseIndex === 0;

  useEffect(() => {
    if (!isExerciseFlowActive || currentExercises.length === 0) {
      router.back();
      return;
    }

    // Timer güncellemesi
    const timer = setInterval(() => {
      if (sessionStartTime) {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        setElapsedTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isExerciseFlowActive, currentExercises, sessionStartTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    Alert.alert('Egzersiz Tamamlandı!', 'Tüm egzersizleri başarıyla tamamladınız. Tebrikler!', [
      {
        text: 'Tamam',
        onPress: () => {
          completeExerciseSession();
          router.back();
        },
      },
    ]);
  };

  const handleQuit = () => {
    Alert.alert('Egzersizi Bitir', 'Egzersizi yarıda bırakmak istediğinizden emin misiniz?', [
      {
        text: 'İptal',
        style: 'cancel',
      },
      {
        text: 'Evet, Bitir',
        style: 'destructive',
        onPress: () => {
          cancelExerciseSession();
          router.back();
        },
      },
    ]);
  };

  const handleNext = () => {
    if (isLastExercise) {
      handleComplete();
    } else {
      nextExercise();
    }
  };

  if (!currentExercise || !currentExercise.exercise) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4263eb" />

      {/* Header with Timer and Navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.navButton, isFirstExercise && styles.navButtonDisabled]}
          onPress={previousExercise}
          disabled={isFirstExercise}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={isFirstExercise ? 'rgba(255,255,255,0.3)' : 'white'}
          />
        </TouchableOpacity>

        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Süre</Text>
          <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.navButton, isLastExercise && styles.navButtonDisabled]}
          onPress={nextExercise}
          disabled={isLastExercise}>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={isLastExercise ? 'rgba(255,255,255,0.3)' : 'white'}
          />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {currentExercises.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressSegment,
                index <= currentExerciseIndex && styles.progressSegmentActive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.progressText}>
          {currentExerciseIndex + 1} / {currentExercises.length}
        </Text>
      </View>

      {/* Exercise Content */}
      <View style={styles.content}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{currentExercise.exercise.name}</Text>

          {currentExercise.exercise.description && (
            <Text style={styles.exerciseDescription}>{currentExercise.exercise.description}</Text>
          )}

          <View style={styles.exerciseDetails}>
            {currentExercise.duration_min && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Hedef Süre</Text>
                <Text style={styles.detailValue}>{currentExercise.duration_min} dakika</Text>
              </View>
            )}

            {currentExercise.difficulty && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Zorluk</Text>
                <Text style={styles.detailValue}>{currentExercise.difficulty.name}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Exercise Illustration Placeholder */}
        <View style={styles.exerciseIllustration}>
          <Text style={styles.illustrationText}>Egzersiz Görseli</Text>
          <Text style={styles.illustrationSubtext}>
            Buraya egzersiz görseli veya videosu gelecek
          </Text>
        </View>
      </View>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
          <Text style={styles.quitButtonText}>Egzersizi Bitir</Text>
        </TouchableOpacity>

        {isLastExercise ? (
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
            <Text style={styles.completeButtonText}>Tamamla</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Sonraki</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4263eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  timerText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressSegment: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 1,
  },
  progressSegmentActive: {
    backgroundColor: 'white',
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  exerciseInfo: {
    marginBottom: 32,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
    textAlign: 'center',
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#495057',
    fontWeight: 'bold',
  },
  exerciseIllustration: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  illustrationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 8,
  },
  illustrationSubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    gap: 16,
    backgroundColor: 'white',
  },
  quitButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#4263eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
