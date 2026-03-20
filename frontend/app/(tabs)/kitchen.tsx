import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../src/utils/api';
import { format, startOfWeek, addDays } from 'date-fns';
import { ro, enUS, es, fr, de, it } from 'date-fns/locale';
import { useSettings } from '../../src/context/SettingsContext';
import * as ImagePicker from 'expo-image-picker';

export default function KitchenScreen() {
  const { t, language, colors: C, isDarkMode } = useSettings();


  const DAYS_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const DAYS = DAYS_KEYS.map(key => t(`kitchen.days.${key}`));

  const gradCard = isDarkMode ? ['#252532', '#1E1E2A'] as const : ['#F8F9FA', '#FFFFFF'] as const;
  const gradModal = isDarkMode ? ['#1E1E2A', '#0F0F14'] as const : ['#F8F9FA', '#E5E7EB'] as const;

  // Meal plan state
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showAdult, setShowAdult] = useState(true);
  const [preferencesModal, setPreferencesModal] = useState(false);
  const [shoppingModal, setShoppingModal] = useState(false);

  // Scanner state
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanResultModal, setScanResultModal] = useState(false);

  // Preferences
  const [adultPrefs, setAdultPrefs] = useState('');
  const [kidPrefs, setKidPrefs] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [numAdults, setNumAdults] = useState('2');
  const [numKids, setNumKids] = useState('1');

  const loadMealPlans = async () => {
    try {
      const plans = await api.getMealPlans();
      setMealPlans(plans);
      if (plans.length > 0) {
        setCurrentPlan(plans[0]);
      }
    } catch (error) {
      console.error('Error loading meal plans:', error);
    }
  };

  useEffect(() => {
    loadMealPlans();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMealPlans();
    setRefreshing(false);
  }, []);

  const generateMealPlan = async () => {
    setPreferencesModal(false);
    setGenerating(true);
    try {
      const newPlan = await api.generateMealPlan({
        adult_preferences: adultPrefs,
        kid_preferences: kidPrefs,
        restrictions: restrictions,
        num_adults: parseInt(numAdults) || 2,
        num_kids: parseInt(numKids) || 1,
      });
      setMealPlans([newPlan, ...mealPlans]);
      setCurrentPlan(newPlan);
      Alert.alert(t('common.success'), t('common.success'));
    } catch (error) {
      console.error('Error generating meal plan:', error);
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setGenerating(false);
    }
  };

  const toggleShoppingItem = async (index: number) => {
    if (!currentPlan) return;
    const updatedList = [...currentPlan.shopping_list];
    updatedList[index] = { ...updatedList[index], checked: !updatedList[index].checked };
    setCurrentPlan({ ...currentPlan, shopping_list: updatedList });
    try {
      await api.updateMealPlan(currentPlan.id, { ...currentPlan, shopping_list: updatedList });
    } catch (error) {
      console.error('Error updating shopping list:', error);
    }
  };

  const deleteMealPlan = async (id: string) => {
    try {
      await api.deleteMealPlan(id);
      const updatedPlans = mealPlans.filter((p) => p.id !== id);
      setMealPlans(updatedPlans);
      setCurrentPlan(updatedPlans[0] || null);
    } catch (error) {
      console.error('Error deleting meal plan:', error);
    }
  };

  // Scanner functions
  const pickImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert(t('common.error'), t('common.error'));
          return;
        }
        result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.5 });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert(t('common.error'), t('common.error'));
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.5 });
      }

      if (!result.canceled && result.assets[0].base64) {
        setScanLoading(true);
        try {
          const data = await api.generateMealsFromImage(result.assets[0].base64, language.code);
          setScanResult(data);
          setScanResultModal(true);
        } catch (error) {
          console.error('Error scanning image:', error);
          Alert.alert(t('common.error'), t('common.error'));
        } finally {
          setScanLoading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const currentMeals = showAdult
    ? currentPlan?.adult_meals?.[selectedDay]
    : currentPlan?.kid_meals?.[selectedDay];

  const checkedCount = currentPlan?.shopping_list?.filter((i: any) => i.checked).length || 0;
  const totalCount = currentPlan?.shopping_list?.length || 0;

  const borderStyle = !isDarkMode ? { borderWidth: 1, borderColor: C.border } : {};

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]} data-testid="kitchen-screen">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />
        }
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={[s.title, { color: C.text }]}>{t('kitchen.mealPlan')}</Text>
            <Text style={[s.subtitle, { color: C.textMuted }]}>
              {t('kitchen.mealPlan')}
            </Text>
          </View>
          <TouchableOpacity
            style={s.generateButton}
            onPress={() => setPreferencesModal(true)}
            disabled={generating}
            data-testid="generate-meal-plan-btn"
          >
            <LinearGradient colors={['#F5A623', '#D4920B']} style={s.generateGradient}>
              {generating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={s.generateButtonText}>{t('kitchen.generate')}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* AI Image Scanner Section */}
        <View style={s.scanSection}>
          <LinearGradient colors={gradCard} style={[s.scanCard, borderStyle]}>
            <View style={s.scanHeader}>
              <View style={[s.scanIcon, { backgroundColor: C.primaryGlow }]}>
                <Ionicons name="camera" size={24} color={C.primary} />
              </View>
              <View style={s.scanInfo}>
                <Text style={[s.scanTitle, { color: C.text }]}>
                  {t('kitchen.foodScanner')}
                </Text>
                <Text style={[s.scanSubtitle, { color: C.textMuted }]}>
                  {t('kitchen.foodScannerHint')}
                </Text>
              </View>
            </View>
            <View style={s.scanButtons}>
              <TouchableOpacity
                style={s.scanBtn}
                onPress={() => pickImage(true)}
                disabled={scanLoading}
                data-testid="scan-camera-btn"
              >
                <LinearGradient colors={['#E91E9C', '#B8157A']} style={s.scanBtnGradient}>
                  <Ionicons name="camera-outline" size={20} color="#fff" />
                  <Text style={s.scanBtnText}>{t('organize.camera')}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.scanBtn}
                onPress={() => pickImage(false)}
                disabled={scanLoading}
                data-testid="scan-gallery-btn"
              >
                <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={s.scanBtnGradient}>
                  <Ionicons name="images-outline" size={20} color="#fff" />
                  <Text style={s.scanBtnText}>{t('organize.gallery')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            {scanLoading && (
              <View style={s.scanLoading}>
                <ActivityIndicator size="large" color={C.primary} />
                <Text style={[s.scanLoadingText, { color: C.textMuted }]}>
                  {t('organize.processingAI')}
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Scan Results Preview */}
        {scanResult && !scanResultModal && (
          <TouchableOpacity
            style={s.scanResultPreview}
            onPress={() => setScanResultModal(true)}
          >
            <LinearGradient colors={gradCard} style={[s.scanResultPreviewGrad, borderStyle]}>
              <View style={[s.scanResultIcon, { backgroundColor: C.greenGlow }]}>
                <Ionicons name="checkmark-circle" size={22} color={C.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.scanResultTitle, { color: C.text }]}>
                  {t('kitchen.mealSuggestions')}
                </Text>
                <Text style={[s.scanResultSub, { color: C.textMuted }]}>
                  {scanResult.food_items?.length || 0} {t('kitchen.foodItems')} - {scanResult.meals?.length || 0} {t('kitchen.recipes')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {generating && (
          <View style={s.generatingContainer}>
            <ActivityIndicator size="large" color={C.gold} />
            <Text style={[s.generatingText, { color: C.text }]}>{t('kitchen.generating')}</Text>
            <Text style={[s.generatingSubtext, { color: C.textMuted }]}>{t('kitchen.generatingHint')}</Text>
          </View>
        )}

        {!generating && currentPlan && (
          <>
            {/* Toggle Adult/Kids */}
            <View style={[s.toggleContainer, { backgroundColor: C.surface }]}>
              <TouchableOpacity
                style={[s.toggleButton, showAdult && { backgroundColor: C.gold }]}
                onPress={() => setShowAdult(true)}
              >
                <Ionicons name="person" size={18} color={showAdult ? '#fff' : C.gold} />
                <Text style={[s.toggleText, { color: showAdult ? '#fff' : C.gold }]}>
                  {t('kitchen.adults')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.toggleButton, !showAdult && { backgroundColor: C.gold }]}
                onPress={() => setShowAdult(false)}
              >
                <Ionicons name="happy" size={18} color={!showAdult ? '#fff' : C.gold} />
                <Text style={[s.toggleText, { color: !showAdult ? '#fff' : C.gold }]}>
                  {t('kitchen.kids')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Day Selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.daysScroll}
              contentContainerStyle={s.daysContainer}
            >
              {DAYS.map((day, index) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    s.dayButton,
                    { backgroundColor: C.surface },
                    selectedDay === index && { backgroundColor: C.gold },
                  ]}
                  onPress={() => setSelectedDay(index)}
                >
                  <Text style={[s.dayText, { color: C.textSecondary }, selectedDay === index && { color: '#fff' }]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Meals for Selected Day */}
            {currentMeals && (
              <View style={s.mealsContainer}>
                {[
                  { icon: 'sunny', label: t('kitchen.meals.breakfast'), text: currentMeals.breakfast, color: C.gold, glow: C.goldGlow },
                  { icon: 'restaurant', label: t('kitchen.meals.lunch'), text: currentMeals.lunch, color: C.blue, glow: C.blueGlow },
                  { icon: 'moon', label: t('kitchen.meals.dinner'), text: currentMeals.dinner, color: C.purple, glow: C.purpleGlow },
                ].map((meal, i) => (
                  <View key={i} style={s.mealCard}>
                    <LinearGradient colors={gradCard} style={[s.mealGradient, borderStyle]}>
                      <View style={[s.mealIcon, { backgroundColor: meal.glow }]}>
                        <Ionicons name={meal.icon as any} size={22} color={meal.color} />
                      </View>
                      <View style={s.mealContent}>
                        <Text style={[s.mealLabel, { color: C.textMuted }]}>{meal.label}</Text>
                        <Text style={[s.mealText, { color: C.text }]}>{meal.text}</Text>
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            )}

            {/* Shopping List Button */}
            <TouchableOpacity style={s.shoppingButton} onPress={() => setShoppingModal(true)}>
              <LinearGradient colors={gradCard} style={[s.shoppingGradient, borderStyle]}>
                <View style={[s.shoppingIcon, { backgroundColor: C.goldGlow }]}>
                  <Ionicons name="cart" size={24} color={C.gold} />
                </View>
                <View style={s.shoppingContent}>
                  <Text style={[s.shoppingTitle, { color: C.text }]}>{t('kitchen.shoppingList')}</Text>
                  <Text style={[s.shoppingSub, { color: C.textMuted }]}>
                    {checkedCount}/{totalCount} {t('kitchen.itemsChecked')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={C.textMuted} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity style={s.deleteButton} onPress={() => deleteMealPlan(currentPlan.id)}>
              <Ionicons name="trash-outline" size={20} color={C.red} />
              <Text style={[s.deleteText, { color: C.red }]}>{t('kitchen.deleteMealPlan')}</Text>
            </TouchableOpacity>
          </>
        )}

        {!generating && !currentPlan && (
          <View style={s.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color={C.textMuted} />
            <Text style={[s.emptyTitle, { color: C.text }]}>{t('kitchen.noMealPlan')}</Text>
            <Text style={[s.emptySub, { color: C.textMuted }]}>{t('kitchen.generateHint')}</Text>
            <TouchableOpacity style={s.emptyButton} onPress={() => setPreferencesModal(true)}>
              <LinearGradient colors={['#F5A623', '#D4920B']} style={s.emptyButtonGrad}>
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text style={s.emptyButtonText}>{t('kitchen.generateNow')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Preferences Modal */}
      <Modal visible={preferencesModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <LinearGradient colors={gradModal} style={s.modalGradient}>
              <View style={[s.modalHeader, { borderBottomColor: C.border }]}>
                <Text style={[s.modalTitle, { color: C.text }]}>{t('kitchen.preferences')}</Text>
                <TouchableOpacity onPress={() => setPreferencesModal(false)}>
                  <Ionicons name="close" size={24} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              <ScrollView style={s.modalBody}>
                <Text style={[s.inputLabel, { color: C.textSecondary }]}>{t('kitchen.adultPreferences')}</Text>
                <TextInput style={[s.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]} value={adultPrefs} onChangeText={setAdultPrefs} placeholder={t('kitchen.exHealthy')} placeholderTextColor={C.textMuted} />
                <Text style={[s.inputLabel, { color: C.textSecondary }]}>{t('kitchen.kidPreferences')}</Text>
                <TextInput style={[s.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]} value={kidPrefs} onChangeText={setKidPrefs} placeholder={t('kitchen.exKidFood')} placeholderTextColor={C.textMuted} />
                <Text style={[s.inputLabel, { color: C.textSecondary }]}>{t('kitchen.dietaryRestrictions')}</Text>
                <TextInput style={[s.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]} value={restrictions} onChangeText={setRestrictions} placeholder={t('kitchen.exRestrictions')} placeholderTextColor={C.textMuted} />
                <View style={s.numberRow}>
                  <View style={s.numberInput}>
                    <Text style={[s.inputLabel, { color: C.textSecondary }]}>{t('kitchen.numAdults')}</Text>
                    <TextInput style={[s.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]} value={numAdults} onChangeText={setNumAdults} keyboardType="numeric" placeholderTextColor={C.textMuted} />
                  </View>
                  <View style={s.numberInput}>
                    <Text style={[s.inputLabel, { color: C.textSecondary }]}>{t('kitchen.numKids')}</Text>
                    <TextInput style={[s.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]} value={numKids} onChangeText={setNumKids} keyboardType="numeric" placeholderTextColor={C.textMuted} />
                  </View>
                </View>
              </ScrollView>
              <TouchableOpacity style={s.saveButton} onPress={generateMealPlan}>
                <LinearGradient colors={['#F5A623', '#D4920B']} style={s.saveGradient}>
                  <Ionicons name="sparkles" size={20} color="#fff" />
                  <Text style={s.saveButtonText}>{t('kitchen.generateWithAI')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Shopping List Modal */}
      <Modal visible={shoppingModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { maxHeight: '80%' }]}>
            <LinearGradient colors={gradModal} style={s.modalGradient}>
              <View style={[s.modalHeader, { borderBottomColor: C.border }]}>
                <Text style={[s.modalTitle, { color: C.text }]}>{t('kitchen.shoppingList')}</Text>
                <TouchableOpacity onPress={() => setShoppingModal(false)}>
                  <Ionicons name="close" size={24} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              <ScrollView style={s.modalBody}>
                {currentPlan?.shopping_list?.map((item: any, index: number) => (
                  <TouchableOpacity key={index} style={[s.shoppingItem, { borderBottomColor: C.border }]} onPress={() => toggleShoppingItem(index)}>
                    <Ionicons name={item.checked ? 'checkbox' : 'square-outline'} size={24} color={item.checked ? C.green : C.textMuted} />
                    <Text style={[s.shoppingItemText, { color: C.text }, item.checked && { textDecorationLine: 'line-through', color: C.textMuted }]}>{item.item}</Text>
                    <Text style={[s.shoppingItemQty, { color: C.textMuted }]}>{item.quantity}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Scan Results Modal */}
      <Modal visible={scanResultModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { maxHeight: '85%' }]}>
            <LinearGradient colors={gradModal} style={s.modalGradient}>
              <View style={[s.modalHeader, { borderBottomColor: C.border }]}>
                <Text style={[s.modalTitle, { color: C.text }]}>
                  {t('kitchen.mealSuggestions')}
                </Text>
                <TouchableOpacity onPress={() => setScanResultModal(false)}>
                  <Ionicons name="close" size={24} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              <ScrollView style={s.modalBody}>
                {/* Food Items */}
                <Text style={[s.scanSectionLabel, { color: C.textSecondary }]}>
                  {t('kitchen.detectedItems')}
                </Text>
                <View style={s.foodChips}>
                  {scanResult?.food_items?.map((item: string, i: number) => (
                    <View key={i} style={[s.foodChip, { backgroundColor: C.surface }]}>
                      <Text style={[s.foodChipText, { color: C.text }]}>{item}</Text>
                    </View>
                  ))}
                </View>

                {/* Meal Suggestions */}
                <Text style={[s.scanSectionLabel, { color: C.textSecondary, marginTop: 20 }]}>
                  {t('kitchen.suggestedRecipes')}
                </Text>
                {scanResult?.meals?.map((meal: any, i: number) => (
                  <View key={i} style={[s.suggMealCard, { backgroundColor: C.surface }]}>
                    <View style={s.suggMealHeader}>
                      <View style={[s.suggMealIcon, { backgroundColor: C.goldGlow }]}>
                        <Ionicons name="restaurant" size={18} color={C.gold} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.suggMealName, { color: C.text }]}>{meal.name}</Text>
                        {meal.time && <Text style={[s.suggMealTime, { color: C.textMuted }]}>{meal.time}</Text>}
                      </View>
                    </View>
                    {meal.ingredients && (
                      <Text style={[s.suggMealDetail, { color: C.textSecondary }]}>
                        {t('kitchen.ingredients')}: {meal.ingredients}
                      </Text>
                    )}
                    {meal.instructions && (
                      <Text style={[s.suggMealDetail, { color: C.textMuted }]}>
                        {meal.instructions}
                      </Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20 },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 14, marginTop: 4 },
  generateButton: { borderRadius: 20, overflow: 'hidden' },
  generateGradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, gap: 6 },
  generateButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  // Scanner
  scanSection: { paddingHorizontal: 20, marginBottom: 16 },
  scanCard: { borderRadius: 20, padding: 16 },
  scanHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  scanIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  scanInfo: { flex: 1 },
  scanTitle: { fontSize: 16, fontWeight: '700' },
  scanSubtitle: { fontSize: 13, marginTop: 2 },
  scanButtons: { flexDirection: 'row', gap: 10 },
  scanBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  scanBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 8 },
  scanBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  scanLoading: { alignItems: 'center', paddingVertical: 20 },
  scanLoadingText: { marginTop: 12, fontSize: 14 },

  // Scan result preview
  scanResultPreview: { marginHorizontal: 20, marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  scanResultPreviewGrad: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  scanResultIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  scanResultTitle: { fontSize: 14, fontWeight: '600' },
  scanResultSub: { fontSize: 12, marginTop: 2 },

  // Meal plan
  generatingContainer: { alignItems: 'center', padding: 40 },
  generatingText: { marginTop: 16, fontSize: 16, fontWeight: '600' },
  generatingSubtext: { marginTop: 8, fontSize: 14 },
  toggleContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, borderRadius: 14, padding: 4 },
  toggleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  toggleText: { fontSize: 14, fontWeight: '600' },
  daysScroll: { marginBottom: 16 },
  daysContainer: { paddingHorizontal: 16, gap: 8 },
  dayButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
  dayText: { fontSize: 14, fontWeight: '600' },
  mealsContainer: { paddingHorizontal: 20, gap: 12 },
  mealCard: { borderRadius: 16, overflow: 'hidden' },
  mealGradient: { flexDirection: 'row', padding: 16, alignItems: 'flex-start', gap: 14 },
  mealIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  mealContent: { flex: 1 },
  mealLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  mealText: { fontSize: 15, lineHeight: 22 },

  // Shopping
  shoppingButton: { marginHorizontal: 20, marginTop: 20, borderRadius: 16, overflow: 'hidden' },
  shoppingGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  shoppingIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  shoppingContent: { flex: 1 },
  shoppingTitle: { fontSize: 16, fontWeight: '600' },
  shoppingSub: { fontSize: 13, marginTop: 2 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 16, paddingVertical: 12, gap: 8 },
  deleteText: { fontSize: 14, fontWeight: '500' },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  emptyButton: { borderRadius: 25, overflow: 'hidden', marginTop: 24 },
  emptyButtonGrad: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, gap: 8 },
  emptyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  modalGradient: { padding: 0 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalBody: { padding: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderRadius: 14, padding: 14, fontSize: 16, marginBottom: 16, borderWidth: 1 },
  numberRow: { flexDirection: 'row', gap: 12 },
  numberInput: { flex: 1 },
  saveButton: { margin: 20, borderRadius: 14, overflow: 'hidden' },
  saveGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  shoppingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  shoppingItemText: { flex: 1, fontSize: 15 },
  shoppingItemQty: { fontSize: 14 },

  // Scan results modal
  scanSectionLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  foodChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  foodChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  foodChipText: { fontSize: 13, fontWeight: '500' },
  suggMealCard: { borderRadius: 16, padding: 14, marginBottom: 10 },
  suggMealHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  suggMealIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  suggMealName: { fontSize: 15, fontWeight: '700' },
  suggMealTime: { fontSize: 12, marginTop: 2 },
  suggMealDetail: { fontSize: 13, lineHeight: 20, marginTop: 4 },
});
