import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../src/utils/api';
import { useSettings } from '../../src/context/SettingsContext';

// Modern 2026 Dark Theme
const C = {
  bg: '#0F0F14',
  bgLight: '#1A1A24',
  card: '#1E1E2A',
  surface: '#252532',
  primary: '#E91E9C',
  primaryGlow: 'rgba(233, 30, 156, 0.15)',
  purple: '#8B5CF6',
  purpleGlow: 'rgba(139, 92, 246, 0.15)',
  blue: '#3B82F6',
  cyan: '#06B6D4',
  gold: '#F5A623',
  green: '#10B981',
  greenGlow: 'rgba(16, 185, 129, 0.15)',
  orange: '#F97316',
  text: '#FFFFFF',
  textSecondary: '#A1A1B5',
  textMuted: '#6B6B80',
  border: '#2A2A3A',
};

// Workout location configurations
const LOCATIONS = [
  { 
    id: 'home', 
    label: 'Acasă', 
    labelEn: 'At Home',
    icon: 'home-outline',
    color: C.primary,
    description: 'Fără echipament',
    descriptionEn: 'No equipment needed',
  },
  { 
    id: 'gym', 
    label: 'Sala', 
    labelEn: 'Gym',
    icon: 'barbell-outline',
    color: C.green,
    description: 'Cu echipament',
    descriptionEn: 'With equipment',
  },
];

// Workout types
const WORKOUT_TYPES = [
  { id: 'full_body', label: 'Full Body', icon: 'body-outline', color: C.purple },
  { id: 'cardio', label: 'Cardio', icon: 'heart-outline', color: C.primary },
  { id: 'strength', label: 'Forță', labelEn: 'Strength', icon: 'fitness-outline', color: C.green },
  { id: 'yoga', label: 'Yoga', icon: 'leaf-outline', color: C.cyan },
  { id: 'stretching', label: 'Stretching', icon: 'expand-outline', color: C.gold },
];

export default function SelfCareScreen() {
  const { language, t } = useSettings();
  const isRo = language.code === 'ro';
  
  const [refreshing, setRefreshing] = useState(false);
  const [generatingWorkout, setGeneratingWorkout] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [selectedType, setSelectedType] = useState(WORKOUT_TYPES[0]);
  const [savedWorkouts, setSavedWorkouts] = useState<any[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<any>(null);
  const [viewWorkoutModal, setViewWorkoutModal] = useState(false);

  const loadWorkouts = async () => {
    try {
      const data = await api.getSelfCare();
      setSavedWorkouts(data?.workout_routines || []);
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  }, []);

  const generateWorkout = async () => {
    setGeneratingWorkout(true);
    
    try {
      const workout = await api.generateWorkoutAI({
        location: selectedLocation.id,
        workout_type: selectedType.id,
        language: language.code,
      });
      
      setCurrentWorkout(workout);
      setViewWorkoutModal(true);
      loadWorkouts();
    } catch (error) {
      console.error('Error generating workout:', error);
      Alert.alert(
        isRo ? 'Eroare' : 'Error', 
        isRo ? 'Nu s-a putut genera antrenamentul' : 'Could not generate workout'
      );
    } finally {
      setGeneratingWorkout(false);
    }
  };

  const deleteWorkout = async (id: string) => {
    Alert.alert(
      isRo ? 'Șterge antrenamentul' : 'Delete workout',
      isRo ? 'Ești sigură?' : 'Are you sure?',
      [
        { text: isRo ? 'Anulează' : 'Cancel', style: 'cancel' },
        {
          text: isRo ? 'Șterge' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteWorkout(id);
              setSavedWorkouts(savedWorkouts.filter((w) => w.id !== id));
              setViewWorkoutModal(false);
            } catch (error) {
              console.error('Error deleting workout:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{isRo ? 'Exerciții AI' : 'AI Workouts'}</Text>
            <Text style={styles.subtitle}>
              {isRo ? 'Antrenamente personalizate' : 'Personalized training'}
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <Ionicons name="fitness" size={28} color={C.green} />
          </View>
        </View>

        {/* Motivational Card */}
        <LinearGradient
          colors={['#E91E9C', '#B8157A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.motivationalCard}
        >
          <View style={styles.motivationalIcon}>
            <Ionicons name="sparkles" size={28} color="#fff" />
          </View>
          <View style={styles.motivationalContent}>
            <Text style={styles.motivationalTitle}>
              {isRo ? 'Timpul tău contează!' : 'Your time matters!'}
            </Text>
            <Text style={styles.motivationalText}>
              {isRo 
                ? 'Chiar și 15 minute pe zi fac diferența pentru sănătatea ta.'
                : 'Even 15 minutes a day make a difference for your health.'}
            </Text>
          </View>
        </LinearGradient>

        {/* Location Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isRo ? 'Unde faci sport?' : 'Where do you workout?'}
          </Text>
          
          <View style={styles.locationsContainer}>
            {LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc.id}
                style={[
                  styles.locationCard,
                  selectedLocation.id === loc.id && styles.locationCardActive,
                ]}
                onPress={() => setSelectedLocation(loc)}
              >
                <LinearGradient
                  colors={selectedLocation.id === loc.id 
                    ? [loc.color, `${loc.color}CC`] 
                    : ['#252532', '#1E1E2A']}
                  style={styles.locationGradient}
                >
                  <View style={[styles.locationIcon, { backgroundColor: `${loc.color}20` }]}>
                    <Ionicons name={loc.icon as any} size={32} color={loc.color} />
                  </View>
                  <Text style={[
                    styles.locationLabel,
                    selectedLocation.id === loc.id && styles.locationLabelActive
                  ]}>
                    {isRo ? loc.label : loc.labelEn}
                  </Text>
                  <Text style={styles.locationDesc}>
                    {isRo ? loc.description : loc.descriptionEn}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Workout Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isRo ? 'Tip de antrenament' : 'Workout type'}
          </Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typesContainer}
          >
            {WORKOUT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeChip,
                  selectedType.id === type.id && { backgroundColor: type.color },
                ]}
                onPress={() => setSelectedType(type)}
              >
                <Ionicons 
                  name={type.icon as any} 
                  size={18} 
                  color={selectedType.id === type.id ? '#fff' : type.color} 
                />
                <Text style={[
                  styles.typeLabel,
                  selectedType.id === type.id && styles.typeLabelActive
                ]}>
                  {isRo ? (type.label || type.id) : (type.labelEn || type.label || type.id)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Generate Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateWorkout}
            disabled={generatingWorkout}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateGradient}
            >
              {generatingWorkout ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={22} color="#fff" />
                  <Text style={styles.generateText}>
                    {isRo ? 'Generează Antrenament' : 'Generate Workout'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Saved Workouts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isRo ? 'Antrenamente Salvate' : 'Saved Workouts'}
          </Text>
          
          {savedWorkouts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="fitness-outline" size={48} color={C.textMuted} />
              <Text style={styles.emptyText}>
                {isRo ? 'Niciun antrenament salvat' : 'No saved workouts'}
              </Text>
            </View>
          ) : (
            savedWorkouts.map((workout: any, index: number) => (
              <TouchableOpacity
                key={workout.id || index}
                style={styles.workoutCard}
                onPress={() => {
                  setCurrentWorkout(workout);
                  setViewWorkoutModal(true);
                }}
              >
                <LinearGradient
                  colors={['#252532', '#1E1E2A']}
                  style={styles.workoutGradient}
                >
                  <View style={styles.workoutIcon}>
                    <Ionicons name="fitness" size={24} color={C.green} />
                  </View>
                  <View style={styles.workoutContent}>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <View style={styles.workoutMeta}>
                      <Ionicons name="time-outline" size={14} color={C.textMuted} />
                      <Text style={styles.workoutDuration}>{workout.duration}</Text>
                      <Text style={styles.workoutExercises}>
                        • {workout.exercises?.length || 0} {isRo ? 'exerciții' : 'exercises'}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* View Workout Modal */}
      <Modal visible={viewWorkoutModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentFull}>
            <LinearGradient
              colors={['#1E1E2A', '#0F0F14']}
              style={styles.workoutModalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{currentWorkout?.name}</Text>
                <TouchableOpacity onPress={() => setViewWorkoutModal(false)}>
                  <Ionicons name="close-circle" size={32} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.workoutMetaBadges}>
                <View style={[styles.workoutBadge, { backgroundColor: C.greenGlow }]}>
                  <Ionicons name="time" size={16} color={C.green} />
                  <Text style={[styles.workoutBadgeText, { color: C.green }]}>
                    {currentWorkout?.duration}
                  </Text>
                </View>
                <View style={[styles.workoutBadge, { backgroundColor: C.primaryGlow }]}>
                  <Ionicons name="location" size={16} color={C.primary} />
                  <Text style={[styles.workoutBadgeText, { color: C.primary }]}>
                    {currentWorkout?.location === 'home' 
                      ? (isRo ? 'Acasă' : 'At Home') 
                      : (isRo ? 'Sala' : 'Gym')}
                  </Text>
                </View>
              </View>
              
              <ScrollView style={styles.exercisesList}>
                {currentWorkout?.exercises?.map((exercise: any, index: number) => (
                  <View key={index} style={styles.exerciseCard}>
                    <LinearGradient
                      colors={['#252532', '#1E1E2A']}
                      style={styles.exerciseGradient}
                    >
                      <View style={styles.exerciseNumber}>
                        <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.exerciseContent}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <View style={styles.exerciseMeta}>
                          <Text style={styles.exerciseDetail}>{exercise.duration}</Text>
                          {exercise.reps && (
                            <Text style={styles.exerciseDetail}>• {exercise.reps}</Text>
                          )}
                        </View>
                        {exercise.description && (
                          <Text style={styles.exerciseDesc}>{exercise.description}</Text>
                        )}
                      </View>
                    </LinearGradient>
                  </View>
                ))}
                
                {currentWorkout?.tips && (
                  <View style={styles.tipsCard}>
                    <Ionicons name="bulb" size={20} color={C.gold} />
                    <Text style={styles.tipsText}>{currentWorkout.tips}</Text>
                  </View>
                )}
              </ScrollView>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => currentWorkout && deleteWorkout(currentWorkout.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  <Text style={styles.deleteText}>{isRo ? 'Șterge' : 'Delete'}</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {generatingWorkout && (
        <View style={styles.loadingOverlay}>
          <LinearGradient
            colors={['rgba(15,15,20,0.95)', 'rgba(15,15,20,0.98)']}
            style={styles.loadingContent}
          >
            <ActivityIndicator size="large" color={C.green} />
            <Text style={styles.loadingText}>
              {isRo ? 'Se generează antrenamentul...' : 'Generating workout...'}
            </Text>
            <Text style={styles.loadingSubtext}>
              {isRo 
                ? `AI creează un plan pentru ${selectedLocation.id === 'home' ? 'acasă' : 'sală'}` 
                : `AI is creating a plan for ${selectedLocation.id === 'home' ? 'home' : 'gym'}`}
            </Text>
          </LinearGradient>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: C.text,
  },
  subtitle: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  motivationalCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    gap: 14,
    alignItems: 'center',
  },
  motivationalIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  motivationalContent: {
    flex: 1,
  },
  motivationalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  motivationalText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 16,
  },
  locationsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  locationCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  locationCardActive: {
    transform: [{ scale: 1.02 }],
  },
  locationGradient: {
    padding: 20,
    alignItems: 'center',
  },
  locationIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  locationLabelActive: {
    color: '#fff',
  },
  locationDesc: {
    fontSize: 12,
    color: C.textMuted,
  },
  typesContainer: {
    gap: 10,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSecondary,
  },
  typeLabelActive: {
    color: '#fff',
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
  },
  generateText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  workoutCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  workoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.greenGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutContent: {
    flex: 1,
  },
  workoutName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  workoutDuration: {
    fontSize: 13,
    color: C.textMuted,
    marginLeft: 4,
  },
  workoutExercises: {
    fontSize: 13,
    color: C.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContentFull: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  workoutModalContent: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: C.text,
    flex: 1,
    marginRight: 12,
  },
  workoutMetaBadges: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  workoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  workoutBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  exercisesList: {
    flex: 1,
  },
  exerciseCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  exerciseGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: C.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  exerciseDetail: {
    fontSize: 13,
    color: C.textMuted,
  },
  exerciseDesc: {
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    gap: 12,
  },
  tipsText: {
    flex: 1,
    fontSize: 13,
    color: C.gold,
    lineHeight: 20,
  },
  modalActions: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  deleteText: {
    fontSize: 15,
    color: '#ef4444',
    fontWeight: '500',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: C.text,
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 8,
  },
});
