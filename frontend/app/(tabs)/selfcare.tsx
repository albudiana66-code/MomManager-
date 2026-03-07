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
  TextInput,
  KeyboardAvoidingView,
  Platform,
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
  blueGlow: 'rgba(59, 130, 246, 0.15)',
  cyan: '#06B6D4',
  gold: '#F5A623',
  goldGlow: 'rgba(245, 166, 35, 0.15)',
  green: '#10B981',
  greenGlow: 'rgba(16, 185, 129, 0.15)',
  orange: '#F97316',
  orangeGlow: 'rgba(249, 115, 22, 0.15)',
  red: '#EF4444',
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

// Health conditions
const HEALTH_CONDITIONS = [
  { id: 'none', label: 'Fără probleme', labelEn: 'No issues' },
  { id: 'back_pain', label: 'Dureri de spate', labelEn: 'Back pain' },
  { id: 'knee_issues', label: 'Probleme genunchi', labelEn: 'Knee issues' },
  { id: 'heart_condition', label: 'Probleme cardiace', labelEn: 'Heart condition' },
  { id: 'pregnancy', label: 'Sarcină', labelEn: 'Pregnancy' },
  { id: 'postpartum', label: 'Postpartum', labelEn: 'Postpartum' },
  { id: 'joint_pain', label: 'Dureri articulare', labelEn: 'Joint pain' },
  { id: 'other', label: 'Altele', labelEn: 'Other' },
];

type TabType = 'workouts' | 'nutrition' | 'profile';

export default function SelfCareScreen() {
  const { language, t, colors: TC, isDarkMode } = useSettings();
  const isRo = language.code === 'ro';
  const gradCard = isDarkMode ? ['#252532', '#1E1E2A'] as const : ['#F8F9FA', '#FFFFFF'] as const;
  const gradModal = isDarkMode ? ['#1E1E2A', '#0F0F14'] as const : ['#F8F9FA', '#E5E7EB'] as const;
  const borderStyle = !isDarkMode ? { borderWidth: 1, borderColor: TC.border } : {};
  
  const [activeTab, setActiveTab] = useState<TabType>('workouts');
  const [refreshing, setRefreshing] = useState(false);
  const [generatingWorkout, setGeneratingWorkout] = useState(false);
  const [generatingMeals, setGeneratingMeals] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [selectedType, setSelectedType] = useState(WORKOUT_TYPES[0]);
  const [savedWorkouts, setSavedWorkouts] = useState<any[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<any>(null);
  const [viewWorkoutModal, setViewWorkoutModal] = useState(false);
  
  // Physical Profile State
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [height, setHeight] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['none']);
  const [otherCondition, setOtherCondition] = useState('');
  const [savedProfile, setSavedProfile] = useState<any>(null);
  
  // Nutrition State
  const [strengthMeals, setStrengthMeals] = useState<any>(null);
  const [viewMealsModal, setViewMealsModal] = useState(false);

  const loadData = async () => {
    try {
      const data = await api.getSelfCare();
      setSavedWorkouts(data?.workout_routines || []);
      if (data?.physical_profile) {
        setSavedProfile(data.physical_profile);
        setCurrentWeight(data.physical_profile.current_weight?.toString() || '');
        setTargetWeight(data.physical_profile.target_weight?.toString() || '');
        setHeight(data.physical_profile.height?.toString() || '');
        setSelectedConditions(data.physical_profile.health_conditions || ['none']);
        setOtherCondition(data.physical_profile.other_condition || '');
      }
      if (data?.strength_meals) {
        setStrengthMeals(data.strength_meals);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const toggleCondition = (conditionId: string) => {
    if (conditionId === 'none') {
      setSelectedConditions(['none']);
    } else {
      const newConditions = selectedConditions.filter(c => c !== 'none');
      if (newConditions.includes(conditionId)) {
        const filtered = newConditions.filter(c => c !== conditionId);
        setSelectedConditions(filtered.length ? filtered : ['none']);
      } else {
        setSelectedConditions([...newConditions, conditionId]);
      }
    }
  };

  const saveProfile = async () => {
    const profile = {
      current_weight: parseFloat(currentWeight) || null,
      target_weight: parseFloat(targetWeight) || null,
      height: parseFloat(height) || null,
      health_conditions: selectedConditions,
      other_condition: otherCondition,
    };

    try {
      await api.savePhysicalProfile(profile);
      setSavedProfile(profile);
      setProfileModalVisible(false);
      Alert.alert(
        isRo ? 'Succes!' : 'Success!',
        isRo ? 'Profilul a fost salvat' : 'Profile saved'
      );
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert(isRo ? 'Eroare' : 'Error', isRo ? 'Nu s-a putut salva profilul' : 'Could not save profile');
    }
  };

  const generateWorkout = async () => {
    setGeneratingWorkout(true);
    
    try {
      const workout = await api.generateWorkoutAI({
        location: selectedLocation.id,
        workout_type: selectedType.id,
        language: language.code,
        physical_profile: savedProfile,
      });
      
      setCurrentWorkout(workout);
      setViewWorkoutModal(true);
      loadData();
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

  const generateStrengthMeals = async () => {
    if (!savedProfile?.current_weight || !savedProfile?.target_weight) {
      Alert.alert(
        isRo ? 'Completează profilul' : 'Complete profile',
        isRo ? 'Te rog completează greutatea actuală și greutatea dorită în secțiunea Profil' : 'Please complete current and target weight in Profile section'
      );
      setActiveTab('profile');
      return;
    }

    setGeneratingMeals(true);
    
    try {
      const meals = await api.generateStrengthMeals({
        physical_profile: savedProfile,
        language: language.code,
      });
      
      setStrengthMeals(meals);
      setViewMealsModal(true);
    } catch (error) {
      console.error('Error generating meals:', error);
      Alert.alert(
        isRo ? 'Eroare' : 'Error', 
        isRo ? 'Nu s-a putut genera planul de mese' : 'Could not generate meal plan'
      );
    } finally {
      setGeneratingMeals(false);
    }
  };

  const deleteWorkout = async (id: string) => {
    try {
      await api.deleteWorkout(id);
      setSavedWorkouts(savedWorkouts.filter((w) => w.id !== id));
      setViewWorkoutModal(false);
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  const getBMI = () => {
    if (savedProfile?.current_weight && savedProfile?.height) {
      const heightM = savedProfile.height / 100;
      const bmi = savedProfile.current_weight / (heightM * heightM);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getWeightDiff = () => {
    if (savedProfile?.current_weight && savedProfile?.target_weight) {
      return (savedProfile.current_weight - savedProfile.target_weight).toFixed(1);
    }
    return null;
  };

  const bmi = getBMI();
  const weightDiff = getWeightDiff();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: TC.bg }]}>
      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'workouts' && styles.tabActive]}
          onPress={() => setActiveTab('workouts')}
        >
          <Ionicons
            name="fitness"
            size={18}
            color={activeTab === 'workouts' ? '#fff' : C.green}
          />
          <Text style={[styles.tabText, activeTab === 'workouts' && styles.tabTextActive]}>
            {isRo ? 'Exerciții' : 'Workouts'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'nutrition' && styles.tabActive]}
          onPress={() => setActiveTab('nutrition')}
        >
          <Ionicons
            name="nutrition"
            size={18}
            color={activeTab === 'nutrition' ? '#fff' : C.orange}
          />
          <Text style={[styles.tabText, activeTab === 'nutrition' && styles.tabTextActive]}>
            {isRo ? 'Mese Forță' : 'Strength Meals'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons
            name="person"
            size={18}
            color={activeTab === 'profile' ? '#fff' : C.purple}
          />
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
            {isRo ? 'Profil' : 'Profile'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
      >
        {/* WORKOUTS TAB */}
        {activeTab === 'workouts' && (
          <View style={styles.tabContent}>
            {/* Profile Summary Card */}
            {savedProfile?.current_weight && (
              <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.profileSummaryCard}>
                <View style={styles.profileSummaryRow}>
                  <View style={styles.profileSummaryItem}>
                    <Text style={styles.profileSummaryValue}>{savedProfile.current_weight} kg</Text>
                    <Text style={styles.profileSummaryLabel}>{isRo ? 'Actual' : 'Current'}</Text>
                  </View>
                  <View style={styles.profileSummaryDivider} />
                  <View style={styles.profileSummaryItem}>
                    <Text style={styles.profileSummaryValue}>{savedProfile.target_weight} kg</Text>
                    <Text style={styles.profileSummaryLabel}>{isRo ? 'Țintă' : 'Target'}</Text>
                  </View>
                  <View style={styles.profileSummaryDivider} />
                  <View style={styles.profileSummaryItem}>
                    <Text style={[styles.profileSummaryValue, { color: weightDiff && parseFloat(weightDiff) > 0 ? C.orange : C.green }]}>
                      {weightDiff ? `${parseFloat(weightDiff) > 0 ? '-' : '+'}${Math.abs(parseFloat(weightDiff))} kg` : '-'}
                    </Text>
                    <Text style={styles.profileSummaryLabel}>{isRo ? 'De slăbit' : 'To lose'}</Text>
                  </View>
                </View>
              </LinearGradient>
            )}

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

            {/* Health Note */}
            {savedProfile?.health_conditions && !savedProfile.health_conditions.includes('none') && (
              <View style={styles.healthNote}>
                <Ionicons name="medical" size={16} color={C.orange} />
                <Text style={styles.healthNoteText}>
                  {isRo 
                    ? 'AI va adapta exercițiile pentru condițiile tale de sănătate'
                    : 'AI will adapt exercises for your health conditions'}
                </Text>
              </View>
            )}

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
          </View>
        )}

        {/* NUTRITION TAB */}
        {activeTab === 'nutrition' && (
          <View style={styles.tabContent}>
            {/* Info Card */}
            <LinearGradient
              colors={['#F97316', '#EA580C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nutritionInfoCard}
            >
              <View style={styles.nutritionIcon}>
                <Ionicons name="nutrition" size={28} color="#fff" />
              </View>
              <View style={styles.nutritionContent}>
                <Text style={styles.nutritionTitle}>
                  {isRo ? 'Mese pentru Masă Musculară' : 'Muscle Building Meals'}
                </Text>
                <Text style={styles.nutritionSubtitle}>
                  {isRo 
                    ? 'Plan de mese AI bazat pe profilul tău fizic'
                    : 'AI meal plan based on your physical profile'}
                </Text>
              </View>
            </LinearGradient>

            {/* Profile Requirements */}
            {(!savedProfile?.current_weight || !savedProfile?.target_weight) && (
              <TouchableOpacity 
                style={styles.warningCard}
                onPress={() => setActiveTab('profile')}
              >
                <Ionicons name="warning" size={24} color={C.orange} />
                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>
                    {isRo ? 'Completează profilul' : 'Complete your profile'}
                  </Text>
                  <Text style={styles.warningText}>
                    {isRo 
                      ? 'Pentru mese personalizate, completează greutatea actuală și țintă'
                      : 'For personalized meals, complete your current and target weight'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
              </TouchableOpacity>
            )}

            {/* Generate Meals Button */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.generateButton}
                onPress={generateStrengthMeals}
                disabled={generatingMeals}
              >
                <LinearGradient
                  colors={['#F97316', '#EA580C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.generateGradient}
                >
                  {generatingMeals ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={22} color="#fff" />
                      <Text style={styles.generateText}>
                        {isRo ? 'Generează Plan Mese' : 'Generate Meal Plan'}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Saved Meals */}
            {strengthMeals && (
              <TouchableOpacity 
                style={styles.mealsCard}
                onPress={() => setViewMealsModal(true)}
              >
                <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.mealsGradient}>
                  <View style={styles.mealsIcon}>
                    <Ionicons name="restaurant" size={24} color={C.orange} />
                  </View>
                  <View style={styles.mealsContent}>
                    <Text style={styles.mealsTitle}>
                      {isRo ? 'Planul tău de mese' : 'Your meal plan'}
                    </Text>
                    <Text style={styles.mealsSubtitle}>
                      {strengthMeals.daily_calories} kcal / {isRo ? 'zi' : 'day'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Nutrition Tips */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{isRo ? 'Sfaturi' : 'Tips'}</Text>
              {[
                { icon: 'water', text: isRo ? 'Bea 2-3L apă zilnic' : 'Drink 2-3L water daily', color: C.blue },
                { icon: 'egg', text: isRo ? 'Proteină la fiecare masă' : 'Protein at every meal', color: C.orange },
                { icon: 'time', text: isRo ? 'Mănâncă la 3-4 ore' : 'Eat every 3-4 hours', color: C.green },
              ].map((tip, i) => (
                <View key={i} style={styles.tipCard}>
                  <View style={[styles.tipIcon, { backgroundColor: `${tip.color}20` }]}>
                    <Ionicons name={tip.icon as any} size={20} color={tip.color} />
                  </View>
                  <Text style={styles.tipText}>{tip.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <View style={styles.tabContent}>
            {/* Stats Cards */}
            <View style={styles.statsRow}>
              <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: C.primaryGlow }]}>
                  <Ionicons name="scale" size={20} color={C.primary} />
                </View>
                <Text style={styles.statValue}>
                  {savedProfile?.current_weight || '-'} <Text style={styles.statUnit}>kg</Text>
                </Text>
                <Text style={styles.statLabel}>{isRo ? 'Greutate' : 'Weight'}</Text>
              </LinearGradient>
              
              <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: C.greenGlow }]}>
                  <Ionicons name="flag" size={20} color={C.green} />
                </View>
                <Text style={styles.statValue}>
                  {savedProfile?.target_weight || '-'} <Text style={styles.statUnit}>kg</Text>
                </Text>
                <Text style={styles.statLabel}>{isRo ? 'Țintă' : 'Target'}</Text>
              </LinearGradient>
              
              <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: C.blueGlow }]}>
                  <Ionicons name="resize" size={20} color={C.blue} />
                </View>
                <Text style={styles.statValue}>
                  {savedProfile?.height || '-'} <Text style={styles.statUnit}>cm</Text>
                </Text>
                <Text style={styles.statLabel}>{isRo ? 'Înălțime' : 'Height'}</Text>
              </LinearGradient>
            </View>

            {/* BMI Card */}
            {bmi && (
              <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.bmiCard}>
                <View style={styles.bmiContent}>
                  <Text style={styles.bmiLabel}>BMI</Text>
                  <Text style={styles.bmiValue}>{bmi}</Text>
                </View>
                <Text style={styles.bmiStatus}>
                  {parseFloat(bmi) < 18.5 ? (isRo ? 'Subponderal' : 'Underweight') :
                   parseFloat(bmi) < 25 ? (isRo ? 'Normal' : 'Normal') :
                   parseFloat(bmi) < 30 ? (isRo ? 'Supraponderal' : 'Overweight') :
                   (isRo ? 'Obezitate' : 'Obese')}
                </Text>
              </LinearGradient>
            )}

            {/* Health Conditions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {isRo ? 'Condiții de sănătate' : 'Health Conditions'}
              </Text>
              <View style={styles.conditionsContainer}>
                {savedProfile?.health_conditions?.map((condId: string) => {
                  const cond = HEALTH_CONDITIONS.find(c => c.id === condId);
                  if (!cond || cond.id === 'none') return null;
                  return (
                    <View key={condId} style={styles.conditionBadge}>
                      <Ionicons name="medical" size={14} color={C.orange} />
                      <Text style={styles.conditionText}>
                        {isRo ? cond.label : cond.labelEn}
                      </Text>
                    </View>
                  );
                })}
                {(!savedProfile?.health_conditions || savedProfile.health_conditions.includes('none')) && (
                  <View style={[styles.conditionBadge, { backgroundColor: C.greenGlow }]}>
                    <Ionicons name="checkmark-circle" size={14} color={C.green} />
                    <Text style={[styles.conditionText, { color: C.green }]}>
                      {isRo ? 'Fără probleme de sănătate' : 'No health issues'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => setProfileModalVisible(true)}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.editProfileGradient}
              >
                <Ionicons name="create" size={22} color="#fff" />
                <Text style={styles.editProfileText}>
                  {isRo ? 'Editează Profilul' : 'Edit Profile'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={profileModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContentFull}>
            <LinearGradient
              colors={['#1E1E2A', '#0F0F14']}
              style={styles.profileModalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isRo ? 'Profilul tău fizic' : 'Your physical profile'}
                </Text>
                <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                  <Ionicons name="close-circle" size={32} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.profileForm}>
                {/* Weight Inputs */}
                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <Text style={styles.inputLabel}>{isRo ? 'Greutate actuală (kg)' : 'Current weight (kg)'}</Text>
                    <TextInput
                      style={styles.input}
                      value={currentWeight}
                      onChangeText={setCurrentWeight}
                      keyboardType="numeric"
                      placeholder="70"
                      placeholderTextColor={C.textMuted}
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <Text style={styles.inputLabel}>{isRo ? 'Greutate dorită (kg)' : 'Target weight (kg)'}</Text>
                    <TextInput
                      style={styles.input}
                      value={targetWeight}
                      onChangeText={setTargetWeight}
                      keyboardType="numeric"
                      placeholder="65"
                      placeholderTextColor={C.textMuted}
                    />
                  </View>
                </View>

                {/* Height */}
                <Text style={styles.inputLabel}>{isRo ? 'Înălțime (cm)' : 'Height (cm)'}</Text>
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  placeholder="165"
                  placeholderTextColor={C.textMuted}
                />

                {/* Health Conditions */}
                <Text style={styles.inputLabel}>{isRo ? 'Probleme de sănătate' : 'Health conditions'}</Text>
                <View style={styles.conditionsGrid}>
                  {HEALTH_CONDITIONS.map((cond) => (
                    <TouchableOpacity
                      key={cond.id}
                      style={[
                        styles.conditionChip,
                        selectedConditions.includes(cond.id) && styles.conditionChipActive,
                      ]}
                      onPress={() => toggleCondition(cond.id)}
                    >
                      <Text style={[
                        styles.conditionChipText,
                        selectedConditions.includes(cond.id) && styles.conditionChipTextActive,
                      ]}>
                        {isRo ? cond.label : cond.labelEn}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Other Condition */}
                {selectedConditions.includes('other') && (
                  <>
                    <Text style={styles.inputLabel}>{isRo ? 'Specifică' : 'Specify'}</Text>
                    <TextInput
                      style={styles.input}
                      value={otherCondition}
                      onChangeText={setOtherCondition}
                      placeholder={isRo ? 'Descrie problema...' : 'Describe the issue...'}
                      placeholderTextColor={C.textMuted}
                    />
                  </>
                )}
              </ScrollView>
              
              <TouchableOpacity style={styles.saveProfileButton} onPress={saveProfile}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.saveProfileGradient}>
                  <Ionicons name="checkmark" size={22} color="#fff" />
                  <Text style={styles.saveProfileText}>{isRo ? 'Salvează' : 'Save'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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

      {/* View Meals Modal */}
      <Modal visible={viewMealsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentFull}>
            <LinearGradient
              colors={['#1E1E2A', '#0F0F14']}
              style={styles.workoutModalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isRo ? 'Plan Mese Forță' : 'Strength Meal Plan'}
                </Text>
                <TouchableOpacity onPress={() => setViewMealsModal(false)}>
                  <Ionicons name="close-circle" size={32} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.workoutMetaBadges}>
                <View style={[styles.workoutBadge, { backgroundColor: C.orangeGlow }]}>
                  <Ionicons name="flame" size={16} color={C.orange} />
                  <Text style={[styles.workoutBadgeText, { color: C.orange }]}>
                    {strengthMeals?.daily_calories} kcal/{isRo ? 'zi' : 'day'}
                  </Text>
                </View>
                <View style={[styles.workoutBadge, { backgroundColor: C.greenGlow }]}>
                  <Ionicons name="nutrition" size={16} color={C.green} />
                  <Text style={[styles.workoutBadgeText, { color: C.green }]}>
                    {strengthMeals?.protein_grams}g {isRo ? 'proteină' : 'protein'}
                  </Text>
                </View>
              </View>
              
              <ScrollView style={styles.exercisesList}>
                {strengthMeals?.meals?.map((meal: any, index: number) => (
                  <View key={index} style={styles.exerciseCard}>
                    <LinearGradient
                      colors={['#252532', '#1E1E2A']}
                      style={styles.exerciseGradient}
                    >
                      <View style={[styles.exerciseNumber, { backgroundColor: C.orange }]}>
                        <Ionicons name="restaurant" size={16} color="#fff" />
                      </View>
                      <View style={styles.exerciseContent}>
                        <Text style={styles.exerciseName}>{meal.name}</Text>
                        <Text style={styles.exerciseDesc}>{meal.foods}</Text>
                        {meal.calories && (
                          <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                        )}
                      </View>
                    </LinearGradient>
                  </View>
                ))}
                
                {strengthMeals?.tips && (
                  <View style={styles.tipsCard}>
                    <Ionicons name="bulb" size={20} color={C.gold} />
                    <Text style={styles.tipsText}>{strengthMeals.tips}</Text>
                  </View>
                )}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {(generatingWorkout || generatingMeals) && (
        <View style={styles.loadingOverlay}>
          <LinearGradient
            colors={['rgba(15,15,20,0.95)', 'rgba(15,15,20,0.98)']}
            style={styles.loadingContent}
          >
            <ActivityIndicator size="large" color={generatingMeals ? C.orange : C.green} />
            <Text style={styles.loadingText}>
              {generatingMeals 
                ? (isRo ? 'Se generează planul de mese...' : 'Generating meal plan...')
                : (isRo ? 'Se generează antrenamentul...' : 'Generating workout...')}
            </Text>
            <Text style={styles.loadingSubtext}>
              {generatingMeals
                ? (isRo ? 'AI calculează necesarul caloric' : 'AI is calculating caloric needs')
                : (isRo ? 'AI adaptează exercițiile pentru tine' : 'AI is adapting exercises for you')}
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
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.surface,
    gap: 4,
  },
  tabActive: {
    backgroundColor: C.primary,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  profileSummaryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  profileSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  profileSummaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: C.border,
  },
  profileSummaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  profileSummaryLabel: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 12,
  },
  locationsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  locationCard: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  locationCardActive: {
    transform: [{ scale: 1.02 }],
  },
  locationGradient: {
    padding: 18,
    alignItems: 'center',
  },
  locationIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  locationLabelActive: {
    color: '#fff',
  },
  locationDesc: {
    fontSize: 11,
    color: C.textMuted,
  },
  typesContainer: {
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSecondary,
  },
  typeLabelActive: {
    color: '#fff',
  },
  healthNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.orangeGlow,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  healthNoteText: {
    flex: 1,
    fontSize: 12,
    color: C.orange,
  },
  generateButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  generateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  workoutCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  workoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  workoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    fontSize: 12,
    color: C.textMuted,
    marginLeft: 4,
  },
  workoutExercises: {
    fontSize: 12,
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
  nutritionInfoCard: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    gap: 14,
    alignItems: 'center',
  },
  nutritionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nutritionContent: {
    flex: 1,
  },
  nutritionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  nutritionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.orangeGlow,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: C.orange,
  },
  warningText: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },
  mealsCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mealsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  mealsIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.orangeGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealsContent: {
    flex: 1,
  },
  mealsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  mealsSubtitle: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: C.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: C.textMuted,
  },
  statLabel: {
    fontSize: 10,
    color: C.textMuted,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  bmiCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  bmiContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  bmiLabel: {
    fontSize: 14,
    color: C.textMuted,
  },
  bmiValue: {
    fontSize: 28,
    fontWeight: '700',
    color: C.text,
  },
  bmiStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: C.green,
  },
  conditionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.orangeGlow,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  conditionText: {
    fontSize: 13,
    color: C.orange,
    fontWeight: '500',
  },
  editProfileButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 16,
  },
  editProfileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  editProfileText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
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
  profileModalContent: {
    flex: 1,
    padding: 20,
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
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    flex: 1,
    marginRight: 12,
  },
  profileForm: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: C.text,
    borderWidth: 1,
    borderColor: C.border,
  },
  conditionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  conditionChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  conditionChipActive: {
    backgroundColor: C.primaryGlow,
    borderColor: C.primary,
  },
  conditionChipText: {
    fontSize: 13,
    color: C.textSecondary,
  },
  conditionChipTextActive: {
    color: C.primary,
    fontWeight: '600',
  },
  saveProfileButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 16,
  },
  saveProfileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  saveProfileText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  workoutMetaBadges: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
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
    marginBottom: 8,
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
  mealCalories: {
    fontSize: 12,
    color: C.orange,
    fontWeight: '600',
    marginTop: 4,
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.goldGlow,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
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
