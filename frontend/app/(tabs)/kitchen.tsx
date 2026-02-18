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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/utils/api';
import { format, startOfWeek, addDays } from 'date-fns';
import { ro, enUS, es, fr, de, it } from 'date-fns/locale';
import { useSettings } from '../../src/context/SettingsContext';

export default function KitchenScreen() {
  const { t, language } = useSettings();
  
  // Get translated days array
  const DAYS_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const DAYS = DAYS_KEYS.map(key => t(`kitchen.days.${key}`));
  
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showAdult, setShowAdult] = useState(true);
  const [preferencesModal, setPreferencesModal] = useState(false);
  const [shoppingModal, setShoppingModal] = useState(false);

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
      Alert.alert(t('common.success'), t('kitchen.mealPlan') + '!');
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
      await api.updateMealPlan(currentPlan.id, {
        ...currentPlan,
        shopping_list: updatedList,
      });
    } catch (error) {
      console.error('Error updating shopping list:', error);
    }
  };

  const deleteMealPlan = async (id: string) => {
    Alert.alert(
      'Șterge Meal Plan',
      'Ești sigură că vrei să ștergi acest meal plan?',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteMealPlan(id);
              const updatedPlans = mealPlans.filter((p) => p.id !== id);
              setMealPlans(updatedPlans);
              setCurrentPlan(updatedPlans[0] || null);
            } catch (error) {
              console.error('Error deleting meal plan:', error);
            }
          },
        },
      ]
    );
  };

  const currentMeals = showAdult
    ? currentPlan?.adult_meals?.[selectedDay]
    : currentPlan?.kid_meals?.[selectedDay];

  const checkedCount = currentPlan?.shopping_list?.filter((i: any) => i.checked).length || 0;
  const totalCount = currentPlan?.shopping_list?.length || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Meal Plan</Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => setPreferencesModal(true)}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text style={styles.generateButtonText}>Generează</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {generating && (
          <View style={styles.generatingContainer}>
            <ActivityIndicator size="large" color="#f59e0b" />
            <Text style={styles.generatingText}>AI generează meal plan-ul tău...</Text>
            <Text style={styles.generatingSubtext}>Acest proces poate dura câteva secunde</Text>
          </View>
        )}

        {!generating && currentPlan && (
          <>
            {/* Toggle Adult/Kids */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, showAdult && styles.toggleActive]}
                onPress={() => setShowAdult(true)}
              >
                <Ionicons
                  name="person"
                  size={18}
                  color={showAdult ? '#fff' : '#f59e0b'}
                />
                <Text style={[styles.toggleText, showAdult && styles.toggleTextActive]}>
                  Adulți
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, !showAdult && styles.toggleActive]}
                onPress={() => setShowAdult(false)}
              >
                <Ionicons
                  name="happy"
                  size={18}
                  color={!showAdult ? '#fff' : '#f59e0b'}
                />
                <Text style={[styles.toggleText, !showAdult && styles.toggleTextActive]}>
                  Copii
                </Text>
              </TouchableOpacity>
            </View>

            {/* Day Selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.daysScroll}
              contentContainerStyle={styles.daysContainer}
            >
              {DAYS.map((day, index) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedDay === index && styles.dayButtonActive,
                  ]}
                  onPress={() => setSelectedDay(index)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selectedDay === index && styles.dayTextActive,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Meals for Selected Day */}
            {currentMeals && (
              <View style={styles.mealsContainer}>
                <View style={styles.mealCard}>
                  <View style={[styles.mealIcon, { backgroundColor: '#fef3c7' }]}>
                    <Ionicons name="sunny" size={24} color="#f59e0b" />
                  </View>
                  <View style={styles.mealContent}>
                    <Text style={styles.mealLabel}>Mic dejun</Text>
                    <Text style={styles.mealText}>{currentMeals.breakfast}</Text>
                  </View>
                </View>

                <View style={styles.mealCard}>
                  <View style={[styles.mealIcon, { backgroundColor: '#dbeafe' }]}>
                    <Ionicons name="restaurant" size={24} color="#3b82f6" />
                  </View>
                  <View style={styles.mealContent}>
                    <Text style={styles.mealLabel}>Prânz</Text>
                    <Text style={styles.mealText}>{currentMeals.lunch}</Text>
                  </View>
                </View>

                <View style={styles.mealCard}>
                  <View style={[styles.mealIcon, { backgroundColor: '#ede9fe' }]}>
                    <Ionicons name="moon" size={24} color="#8b5cf6" />
                  </View>
                  <View style={styles.mealContent}>
                    <Text style={styles.mealLabel}>Cină</Text>
                    <Text style={styles.mealText}>{currentMeals.dinner}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Shopping List Button */}
            <TouchableOpacity
              style={styles.shoppingButton}
              onPress={() => setShoppingModal(true)}
            >
              <View style={styles.shoppingIcon}>
                <Ionicons name="cart" size={24} color="#f59e0b" />
              </View>
              <View style={styles.shoppingContent}>
                <Text style={styles.shoppingTitle}>Listă de cumpărături</Text>
                <Text style={styles.shoppingSubtitle}>
                  {checkedCount}/{totalCount} produse bifate
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteMealPlan(currentPlan.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text style={styles.deleteButtonText}>Șterge meal plan</Text>
            </TouchableOpacity>
          </>
        )}

        {!generating && !currentPlan && (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Niciun meal plan</Text>
            <Text style={styles.emptySubtitle}>
              Generează un meal plan personalizat cu AI
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setPreferencesModal(true)}
            >
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Generează acum</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Preferences Modal */}
      <Modal visible={preferencesModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Preferințe Meal Plan</Text>
              <TouchableOpacity onPress={() => setPreferencesModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Preferințe adulți</Text>
              <TextInput
                style={styles.input}
                value={adultPrefs}
                onChangeText={setAdultPrefs}
                placeholder="Ex: mese sănătoase, echilibrate"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.inputLabel}>Preferințe copii</Text>
              <TextInput
                style={styles.input}
                value={kidPrefs}
                onChangeText={setKidPrefs}
                placeholder="Ex: mese simple, kid-friendly"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.inputLabel}>Restricții alimentare</Text>
              <TextInput
                style={styles.input}
                value={restrictions}
                onChangeText={setRestrictions}
                placeholder="Ex: fără lactate, vegetarian"
                placeholderTextColor="#9ca3af"
              />

              <View style={styles.numberRow}>
                <View style={styles.numberInput}>
                  <Text style={styles.inputLabel}>Nr. adulți</Text>
                  <TextInput
                    style={styles.input}
                    value={numAdults}
                    onChangeText={setNumAdults}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.numberInput}>
                  <Text style={styles.inputLabel}>Nr. copii</Text>
                  <TextInput
                    style={styles.input}
                    value={numKids}
                    onChangeText={setNumKids}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.saveButton} onPress={generateMealPlan}>
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Generează cu AI</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Shopping List Modal */}
      <Modal visible={shoppingModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Listă de cumpărături</Text>
              <TouchableOpacity onPress={() => setShoppingModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {currentPlan?.shopping_list?.map((item: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.shoppingItem}
                  onPress={() => toggleShoppingItem(index)}
                >
                  <Ionicons
                    name={item.checked ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={item.checked ? '#10b981' : '#9ca3af'}
                  />
                  <Text
                    style={[
                      styles.shoppingItemText,
                      item.checked && styles.shoppingItemChecked,
                    ]}
                  >
                    {item.item}
                  </Text>
                  <Text style={styles.shoppingItemQty}>{item.quantity}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbeb',
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
    color: '#92400e',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  generatingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  generatingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  generatingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  toggleActive: {
    backgroundColor: '#f59e0b',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  toggleTextActive: {
    color: '#fff',
  },
  daysScroll: {
    marginBottom: 16,
  },
  daysContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  dayButtonActive: {
    backgroundColor: '#f59e0b',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  dayTextActive: {
    color: '#fff',
  },
  mealsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mealIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealContent: {
    flex: 1,
  },
  mealLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  mealText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  shoppingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  shoppingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shoppingContent: {
    flex: 1,
  },
  shoppingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  shoppingSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 12,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#92400e',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 24,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  numberRow: {
    flexDirection: 'row',
    gap: 12,
  },
  numberInput: {
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
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
  shoppingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  shoppingItemText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  shoppingItemChecked: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  shoppingItemQty: {
    fontSize: 14,
    color: '#6b7280',
  },
});
