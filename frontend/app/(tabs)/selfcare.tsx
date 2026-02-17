import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/utils/api';

type TabType = 'nutrition' | 'workout';

export default function SelfCareScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('nutrition');
  const [selfCare, setSelfCare] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingNutrition, setGeneratingNutrition] = useState(false);
  const [generatingWorkout, setGeneratingWorkout] = useState(false);

  // Nutrition Modal
  const [nutritionModal, setNutritionModal] = useState(false);
  const [nutritionGoal, setNutritionGoal] = useState('energie și sănătate');
  const [age, setAge] = useState('30');
  const [activityLevel, setActivityLevel] = useState('moderat');
  const [dietRestrictions, setDietRestrictions] = useState('');
  const [cookingTime, setCookingTime] = useState('30 minute');

  // Workout Modal
  const [workoutModal, setWorkoutModal] = useState(false);
  const [workoutFocus, setWorkoutFocus] = useState('full body');
  const [fitnessLevel, setFitnessLevel] = useState('începător');
  const [workoutDuration, setWorkoutDuration] = useState('15-20 minute');
  const [workoutGoals, setWorkoutGoals] = useState('energie, forță, flexibilitate');

  // Workout Detail Modal
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

  const loadSelfCare = async () => {
    try {
      const data = await api.getSelfCare();
      setSelfCare(data);
    } catch (error) {
      console.error('Error loading self-care data:', error);
    }
  };

  useEffect(() => {
    loadSelfCare();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSelfCare();
    setRefreshing(false);
  }, []);

  const generateNutritionPlan = async () => {
    setNutritionModal(false);
    setGeneratingNutrition(true);

    try {
      const nutritionPlan = await api.generateNutritionPlan({
        goal: nutritionGoal,
        age: age,
        activity_level: activityLevel,
        restrictions: dietRestrictions,
        cooking_time: cookingTime,
      });
      setSelfCare({ ...selfCare, nutrition_plan: nutritionPlan });
      Alert.alert('Succes', 'Plan de nutriție generat cu succes!');
    } catch (error) {
      console.error('Error generating nutrition plan:', error);
      Alert.alert('Eroare', 'Nu s-a putut genera planul de nutriție');
    } finally {
      setGeneratingNutrition(false);
    }
  };

  const generateWorkout = async () => {
    setWorkoutModal(false);
    setGeneratingWorkout(true);

    try {
      const workout = await api.generateWorkout({
        focus: workoutFocus,
        fitness_level: fitnessLevel,
        duration: workoutDuration,
        goals: workoutGoals,
      });
      const updatedRoutines = [...(selfCare?.workout_routines || []), workout];
      setSelfCare({ ...selfCare, workout_routines: updatedRoutines });
      Alert.alert('Succes', 'Antrenament generat cu succes!');
    } catch (error) {
      console.error('Error generating workout:', error);
      Alert.alert('Eroare', 'Nu s-a putut genera antrenamentul');
    } finally {
      setGeneratingWorkout(false);
    }
  };

  const deleteWorkout = async (id: string) => {
    Alert.alert(
      'Șterge antrenamentul',
      'Ești sigură că vrei să ștergi acest antrenament?',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteWorkout(id);
              const updatedRoutines = selfCare.workout_routines.filter(
                (w: any) => w.id !== id
              );
              setSelfCare({ ...selfCare, workout_routines: updatedRoutines });
              setSelectedWorkout(null);
            } catch (error) {
              console.error('Error deleting workout:', error);
            }
          },
        },
      ]
    );
  };

  const ACTIVITY_LEVELS = ['sedentar', 'moderat', 'activ', 'foarte activ'];
  const FITNESS_LEVELS = ['începător', 'intermediar', 'avansat'];
  const FOCUS_AREAS = ['full body', 'partea superioară', 'partea inferioară', 'cardio', 'core', 'stretching'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ec4899" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Self-Care</Text>
          <View style={styles.headerIcons}>
            <Ionicons name="heart" size={24} color="#ec4899" />
            <Ionicons name="fitness" size={24} color="#8b5cf6" />
          </View>
        </View>

        {/* Motivational Card */}
        <View style={styles.motivationalCard}>
          <View style={styles.motivationalIcon}>
            <Ionicons name="sparkles" size={28} color="#ec4899" />
          </View>
          <View style={styles.motivationalContent}>
            <Text style={styles.motivationalTitle}>Timpul tău contează!</Text>
            <Text style={styles.motivationalText}>
              Chiar și 15 minute pe zi fac diferența pentru sănătatea ta.
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'nutrition' && styles.tabActive]}
            onPress={() => setActiveTab('nutrition')}
          >
            <Ionicons
              name="nutrition"
              size={20}
              color={activeTab === 'nutrition' ? '#fff' : '#ec4899'}
            />
            <Text style={[styles.tabText, activeTab === 'nutrition' && styles.tabTextActive]}>
              Nutriție
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'workout' && styles.tabActive]}
            onPress={() => setActiveTab('workout')}
          >
            <Ionicons
              name="fitness"
              size={20}
              color={activeTab === 'workout' ? '#fff' : '#ec4899'}
            />
            <Text style={[styles.tabText, activeTab === 'workout' && styles.tabTextActive]}>
              Sport
            </Text>
          </TouchableOpacity>
        </View>

        {/* Nutrition Tab */}
        {activeTab === 'nutrition' && (
          <View style={styles.section}>
            {generatingNutrition ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ec4899" />
                <Text style={styles.loadingText}>AI generează planul tău de nutriție...</Text>
              </View>
            ) : selfCare?.nutrition_plan ? (
              <View style={styles.nutritionCard}>
                <View style={styles.nutritionHeader}>
                  <View style={styles.nutritionIcon}>
                    <Ionicons name="restaurant" size={24} color="#10b981" />
                  </View>
                  <View style={styles.nutritionHeaderContent}>
                    <Text style={styles.nutritionGoal}>
                      Obiectiv: {selfCare.nutrition_plan.goal}
                    </Text>
                    <Text style={styles.nutritionCalories}>
                      {selfCare.nutrition_plan.daily_calories} kcal/zi
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setNutritionModal(true)}>
                    <Ionicons name="refresh" size={22} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.mealsContainer}>
                  <Text style={styles.mealsTitle}>Plan alimentar zilnic</Text>
                  {selfCare.nutrition_plan.meals?.map((meal: string, index: number) => (
                    <View key={index} style={styles.mealItem}>
                      <View style={[styles.mealDot, { backgroundColor: getMealColor(index) }]} />
                      <Text style={styles.mealText}>{meal}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="nutrition-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyTitle}>Niciun plan de nutriție</Text>
                <Text style={styles.emptySubtitle}>
                  Generează un plan personalizat cu AI
                </Text>
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={() => setNutritionModal(true)}
                >
                  <Ionicons name="sparkles" size={20} color="#fff" />
                  <Text style={styles.generateButtonText}>Generează plan</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Workout Tab */}
        {activeTab === 'workout' && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.addWorkoutButton}
              onPress={() => setWorkoutModal(true)}
              disabled={generatingWorkout}
            >
              {generatingWorkout ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#fff" />
                  <Text style={styles.addWorkoutText}>Generează antrenament nou</Text>
                </>
              )}
            </TouchableOpacity>

            {generatingWorkout && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>AI creează antrenamentul tău...</Text>
              </View>
            )}

            {selfCare?.workout_routines?.length === 0 && !generatingWorkout && (
              <View style={styles.emptyWorkouts}>
                <Ionicons name="fitness-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyWorkoutsText}>
                  Niciun antrenament salvat
                </Text>
              </View>
            )}

            {selfCare?.workout_routines?.map((workout: any) => (
              <TouchableOpacity
                key={workout.id}
                style={styles.workoutCard}
                onPress={() => setSelectedWorkout(workout)}
              >
                <View style={styles.workoutIcon}>
                  <Ionicons name="fitness" size={24} color="#8b5cf6" />
                </View>
                <View style={styles.workoutContent}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <View style={styles.workoutMeta}>
                    <Ionicons name="time-outline" size={14} color="#6b7280" />
                    <Text style={styles.workoutDuration}>{workout.duration}</Text>
                    <Text style={styles.workoutExercises}>
                      • {workout.exercises?.length || 0} exerciții
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Nutrition Modal */}
      <Modal visible={nutritionModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Plan de nutriție</Text>
              <TouchableOpacity onPress={() => setNutritionModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Obiectiv</Text>
              <TextInput
                style={styles.input}
                value={nutritionGoal}
                onChangeText={setNutritionGoal}
                placeholder="Ex: energie și sănătate"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.inputLabel}>Vârsta</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="30"
              />

              <Text style={styles.inputLabel}>Nivel de activitate</Text>
              <View style={styles.optionsRow}>
                {ACTIVITY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.optionChip,
                      activityLevel === level && styles.optionChipActive,
                    ]}
                    onPress={() => setActivityLevel(level)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        activityLevel === level && styles.optionChipTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Restricții alimentare (opțional)</Text>
              <TextInput
                style={styles.input}
                value={dietRestrictions}
                onChangeText={setDietRestrictions}
                placeholder="Ex: fără lactate, vegetarian"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.inputLabel}>Timp pentru gătit</Text>
              <TextInput
                style={styles.input}
                value={cookingTime}
                onChangeText={setCookingTime}
                placeholder="Ex: 30 minute"
                placeholderTextColor="#9ca3af"
              />
            </ScrollView>
            <TouchableOpacity style={styles.saveButton} onPress={generateNutritionPlan}>
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Generează cu AI</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Workout Modal */}
      <Modal visible={workoutModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Antrenament nou</Text>
              <TouchableOpacity onPress={() => setWorkoutModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Zonă de focus</Text>
              <View style={styles.optionsRow}>
                {FOCUS_AREAS.map((focus) => (
                  <TouchableOpacity
                    key={focus}
                    style={[
                      styles.optionChip,
                      workoutFocus === focus && styles.optionChipActive,
                    ]}
                    onPress={() => setWorkoutFocus(focus)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        workoutFocus === focus && styles.optionChipTextActive,
                      ]}
                    >
                      {focus}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Nivel de fitness</Text>
              <View style={styles.optionsRow}>
                {FITNESS_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.optionChip,
                      fitnessLevel === level && styles.optionChipActive,
                    ]}
                    onPress={() => setFitnessLevel(level)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        fitnessLevel === level && styles.optionChipTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Durată</Text>
              <TextInput
                style={styles.input}
                value={workoutDuration}
                onChangeText={setWorkoutDuration}
                placeholder="15-20 minute"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.inputLabel}>Obiective</Text>
              <TextInput
                style={styles.input}
                value={workoutGoals}
                onChangeText={setWorkoutGoals}
                placeholder="energie, forță, flexibilitate"
                placeholderTextColor="#9ca3af"
              />
            </ScrollView>
            <TouchableOpacity style={styles.saveButton} onPress={generateWorkout}>
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Generează cu AI</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Workout Detail Modal */}
      <Modal visible={!!selectedWorkout} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedWorkout?.name}</Text>
              <TouchableOpacity onPress={() => setSelectedWorkout(null)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.workoutDetailHeader}>
                <View style={styles.workoutDetailMeta}>
                  <Ionicons name="time" size={18} color="#8b5cf6" />
                  <Text style={styles.workoutDetailDuration}>
                    {selectedWorkout?.duration}
                  </Text>
                </View>
                <Text style={styles.workoutDetailCount}>
                  {selectedWorkout?.exercises?.length || 0} exerciții
                </Text>
              </View>

              {selectedWorkout?.exercises?.map((exercise: any, index: number) => (
                <View key={index} style={styles.exerciseCard}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.exerciseContent}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <View style={styles.exerciseMeta}>
                      <Text style={styles.exerciseDetail}>
                        {exercise.duration}
                      </Text>
                      {exercise.reps && (
                        <Text style={styles.exerciseDetail}>• {exercise.reps} rep</Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={styles.workoutActions}>
              <TouchableOpacity
                style={styles.deleteWorkoutButton}
                onPress={() => deleteWorkout(selectedWorkout?.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                <Text style={styles.deleteWorkoutText}>Șterge</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getMealColor = (index: number) => {
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf2f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#9d174d',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  motivationalCard: {
    flexDirection: 'row',
    backgroundColor: '#fce7f3',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    alignItems: 'center',
  },
  motivationalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  motivationalContent: {
    flex: 1,
  },
  motivationalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9d174d',
  },
  motivationalText: {
    fontSize: 13,
    color: '#be185d',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#fce7f3',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#ec4899',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ec4899',
  },
  tabTextActive: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6b7280',
  },
  nutritionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  nutritionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  nutritionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nutritionHeaderContent: {
    flex: 1,
  },
  nutritionGoal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  nutritionCalories: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '700',
    marginTop: 2,
  },
  mealsContainer: {
    marginTop: 16,
  },
  mealsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  mealDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  mealText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9d174d',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ec4899',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
    gap: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  addWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  addWorkoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyWorkouts: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyWorkoutsText: {
    fontSize: 15,
    color: '#9ca3af',
    marginTop: 12,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutContent: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  workoutDuration: {
    fontSize: 13,
    color: '#6b7280',
  },
  workoutExercises: {
    fontSize: 13,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  optionChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  optionChipActive: {
    backgroundColor: '#ec4899',
  },
  optionChipText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  optionChipTextActive: {
    color: '#fff',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ec4899',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  workoutDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  workoutDetailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workoutDetailDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  workoutDetailCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8b5cf6',
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
    color: '#1f2937',
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  exerciseDetail: {
    fontSize: 13,
    color: '#6b7280',
  },
  workoutActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  deleteWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  deleteWorkoutText: {
    fontSize: 15,
    color: '#ef4444',
    fontWeight: '500',
  },
});
