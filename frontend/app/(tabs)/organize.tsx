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
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../src/utils/api';
import { format } from 'date-fns';
import { ro, enUS, es, fr, de } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';
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
  blue: '#3B82F6',
  blueGlow: 'rgba(59, 130, 246, 0.15)',
  cyan: '#06B6D4',
  gold: '#F5A623',
  green: '#10B981',
  greenGlow: 'rgba(16, 185, 129, 0.15)',
  orange: '#F97316',
  red: '#EF4444',
  text: '#FFFFFF',
  textSecondary: '#A1A1B5',
  textMuted: '#6B6B80',
  border: '#2A2A3A',
};

type TabType = 'checklist' | 'budget' | 'receipts';

const dateLocales: { [key: string]: any } = {
  ro: ro, en: enUS, 'en-US': enUS, es: es, fr: fr, de: de,
};

export default function OrganizeScreen() {
  const { t, currencySymbol, language } = useSettings();
  const isRo = language.code === 'ro';
  const [activeTab, setActiveTab] = useState<TabType>('checklist');
  const [refreshing, setRefreshing] = useState(false);
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const currentMonth = format(today, 'yyyy-MM');
  const dateLocale = dateLocales[language.code] || dateLocales[language.code.split('-')[0]] || enUS;

  const getCategoryName = (key: string) => {
    const categoryMap: { [key: string]: string } = {
      'Alimente': t('organize.categories.food'),
      'Utilități': t('organize.categories.utilities'),
      'Transport': t('organize.categories.transport'),
      'Sănătate': t('organize.categories.health'),
      'Educație': t('organize.categories.education'),
      'Divertisment': t('organize.categories.entertainment'),
    };
    return categoryMap[key] || key;
  };

  const DEFAULT_CATEGORIES = [
    { name: 'Alimente', budget: 2000, spent: 0 },
    { name: 'Utilități', budget: 800, spent: 0 },
    { name: 'Transport', budget: 500, spent: 0 },
    { name: 'Sănătate', budget: 300, spent: 0 },
    { name: 'Educație', budget: 400, spent: 0 },
    { name: 'Divertisment', budget: 300, spent: 0 },
  ];

  // Checklist state
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');

  // Budget state
  const [budget, setBudget] = useState<any>(null);
  const [editCategoryModal, setEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categorySpent, setCategorySpent] = useState('');
  const [categoryBudgetAmount, setCategoryBudgetAmount] = useState('');
  const [editTotalBudgetModal, setEditTotalBudgetModal] = useState(false);
  const [totalBudgetInput, setTotalBudgetInput] = useState('');

  // Receipts state
  const [receipts, setReceipts] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);

  const loadData = async () => {
    try {
      const [checklists, budgets, receiptsData] = await Promise.all([
        api.getChecklists(todayStr),
        api.getBudgets(currentMonth),
        api.getReceipts(),
      ]);

      if (checklists.length > 0) {
        setChecklistItems(checklists[0].items || []);
      } else {
        setChecklistItems([]);
      }

      if (budgets.length > 0) {
        setBudget(budgets[0]);
      } else {
        const newBudget = await api.saveBudget({
          month: currentMonth,
          categories: DEFAULT_CATEGORIES,
        });
        setBudget(newBudget);
      }

      setReceipts(receiptsData);
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

  // Checklist functions
  const addTask = async () => {
    if (!newTask.trim()) return;

    const newItem = {
      id: uuidv4(),
      text: newTask.trim(),
      completed: false,
    };

    const updatedItems = [...checklistItems, newItem];
    setChecklistItems(updatedItems);
    setNewTask('');

    try {
      await api.saveChecklist({ date: todayStr, items: updatedItems });
    } catch (error) {
      console.error('Error saving checklist:', error);
    }
  };

  const toggleTask = async (id: string) => {
    const updatedItems = checklistItems.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklistItems(updatedItems);

    try {
      await api.saveChecklist({ date: todayStr, items: updatedItems });
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const deleteTask = async (id: string) => {
    const updatedItems = checklistItems.filter((item) => item.id !== id);
    setChecklistItems(updatedItems);

    try {
      await api.saveChecklist({ date: todayStr, items: updatedItems });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Budget functions
  const updateCategory = async () => {
    if (!editingCategory) return;

    const spent = parseFloat(categorySpent) || 0;
    const newBudget = parseFloat(categoryBudgetAmount) || editingCategory.budget;
    
    const updatedCategories = budget.categories.map((cat: any) =>
      cat.name === editingCategory.name ? { ...cat, spent, budget: newBudget } : cat
    );

    setBudget({ ...budget, categories: updatedCategories });
    setEditCategoryModal(false);

    try {
      await api.saveBudget({ month: currentMonth, categories: updatedCategories });
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const updateTotalBudget = async () => {
    const newTotal = parseFloat(totalBudgetInput);
    if (!newTotal || newTotal <= 0) {
      Alert.alert(t('common.error'), isRo ? 'Te rog introdu o sumă validă' : 'Please enter a valid amount');
      return;
    }

    const currentTotal = budget.categories.reduce((sum: number, cat: any) => sum + cat.budget, 0);
    const ratio = newTotal / currentTotal;

    const updatedCategories = budget.categories.map((cat: any) => ({
      ...cat,
      budget: Math.round(cat.budget * ratio),
    }));

    setBudget({ ...budget, categories: updatedCategories });
    setEditTotalBudgetModal(false);

    try {
      await api.saveBudget({ month: currentMonth, categories: updatedCategories });
    } catch (error) {
      console.error('Error updating total budget:', error);
    }
  };

  // Receipt functions
  const scanReceipt = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('common.error'), isRo ? 'Permisiune cameră necesară' : 'Camera permission required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        base64: true,
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].base64) {
        setScanning(true);
        try {
          const receipt = await api.scanReceipt(result.assets[0].base64);
          setReceipts([receipt, ...receipts]);
          Alert.alert(t('common.success'), isRo ? 'Bon scanat cu succes!' : 'Receipt scanned!');
        } catch (error) {
          console.error('Error scanning receipt:', error);
          Alert.alert(t('common.error'), isRo ? 'Nu s-a putut procesa bonul' : 'Could not process receipt');
        } finally {
          setScanning(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const deleteReceipt = async (id: string) => {
    try {
      await api.deleteReceipt(id);
      setReceipts(receipts.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Error deleting receipt:', error);
    }
  };

  const totalBudget = budget?.categories.reduce((sum: number, cat: any) => sum + cat.budget, 0) || 0;
  const totalSpent = budget?.categories.reduce((sum: number, cat: any) => sum + cat.spent, 0) || 0;
  const completedTasks = checklistItems.filter((i) => i.completed).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'checklist' && styles.tabActive]}
          onPress={() => setActiveTab('checklist')}
        >
          <Ionicons
            name="checkbox"
            size={18}
            color={activeTab === 'checklist' ? '#fff' : C.blue}
          />
          <Text style={[styles.tabText, activeTab === 'checklist' && styles.tabTextActive]}>
            {t('organize.checklist')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'budget' && styles.tabActive]}
          onPress={() => setActiveTab('budget')}
        >
          <Ionicons
            name="wallet"
            size={18}
            color={activeTab === 'budget' ? '#fff' : C.green}
          />
          <Text style={[styles.tabText, activeTab === 'budget' && styles.tabTextActive]}>
            {t('organize.budget')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'receipts' && styles.tabActive]}
          onPress={() => setActiveTab('receipts')}
        >
          <Ionicons
            name="receipt"
            size={18}
            color={activeTab === 'receipts' ? '#fff' : C.purple}
          />
          <Text style={[styles.tabText, activeTab === 'receipts' && styles.tabTextActive]}>
            {t('organize.receipts')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
      >
        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <View>
            <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.headerCard}>
              <Text style={styles.headerTitle}>{t('organize.dailyChecklist')}</Text>
              <Text style={styles.headerSubtitle}>
                {format(today, 'EEEE, d MMMM', { locale: dateLocale })}
              </Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${checklistItems.length ? (completedTasks / checklistItems.length) * 100 : 0}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {completedTasks}/{checklistItems.length} {t('organize.complete')}
                </Text>
              </View>
            </LinearGradient>

            <View style={styles.addTaskContainer}>
              <TextInput
                style={styles.addTaskInput}
                value={newTask}
                onChangeText={setNewTask}
                placeholder={t('organize.addTask')}
                placeholderTextColor={C.textMuted}
                onSubmitEditing={addTask}
              />
              <TouchableOpacity style={styles.addTaskButton} onPress={addTask}>
                <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.addTaskGradient}>
                  <Ionicons name="add" size={24} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {checklistItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.taskItem}
                onPress={() => toggleTask(item.id)}
              >
                <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.taskGradient}>
                  <Ionicons
                    name={item.completed ? 'checkbox' : 'square-outline'}
                    size={24}
                    color={item.completed ? C.green : C.textMuted}
                  />
                  <Text style={[styles.taskText, item.completed && styles.taskCompleted]}>
                    {item.text}
                  </Text>
                  <TouchableOpacity onPress={() => deleteTask(item.id)}>
                    <Ionicons name="close-circle" size={22} color={C.red} />
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && budget && (
          <View>
            <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.headerCard}>
              <View style={styles.budgetHeaderRow}>
                <Text style={styles.headerTitle}>{t('organize.familyBudget')}</Text>
                <TouchableOpacity 
                  style={styles.editBudgetButton}
                  onPress={() => {
                    setTotalBudgetInput(totalBudget.toString());
                    setEditTotalBudgetModal(true);
                  }}
                >
                  <Ionicons name="pencil" size={16} color={C.green} />
                </TouchableOpacity>
              </View>
              <Text style={styles.headerSubtitle}>
                {format(today, 'MMMM yyyy', { locale: dateLocale })}
              </Text>
              <View style={styles.budgetSummary}>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>{t('organize.totalBudget')}</Text>
                  <Text style={styles.budgetValue}>{totalBudget} {currencySymbol}</Text>
                </View>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>{t('organize.spent')}</Text>
                  <Text style={[styles.budgetValue, { color: C.red }]}>{totalSpent} {currencySymbol}</Text>
                </View>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>{t('organize.remaining')}</Text>
                  <Text style={[styles.budgetValue, { color: C.green }]}>
                    {totalBudget - totalSpent} {currencySymbol}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {budget.categories.map((cat: any) => {
              const percentage = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0;
              const isOver = percentage > 100;

              return (
                <TouchableOpacity
                  key={cat.name}
                  style={styles.categoryCard}
                  onPress={() => {
                    setEditingCategory(cat);
                    setCategorySpent(cat.spent.toString());
                    setCategoryBudgetAmount(cat.budget.toString());
                    setEditCategoryModal(true);
                  }}
                >
                  <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.categoryGradient}>
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryName}>{getCategoryName(cat.name)}</Text>
                      <Text style={[styles.categorySpent, isOver && { color: C.red }]}>
                        {cat.spent} / {cat.budget} {currencySymbol}
                      </Text>
                    </View>
                    <View style={styles.categoryProgress}>
                      <View
                        style={[
                          styles.categoryProgressFill,
                          {
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: isOver ? C.red : C.green,
                          },
                        ]}
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Receipts Tab */}
        {activeTab === 'receipts' && (
          <View>
            <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.headerCard}>
              <Text style={styles.headerTitle}>{t('organize.scannedReceipts')}</Text>
              <Text style={styles.headerSubtitle}>
                {isRo ? 'Scanează bonuri cu AI' : 'Scan receipts with AI'}
              </Text>
              <View style={styles.scanButtons}>
                <TouchableOpacity style={styles.scanButton} onPress={scanReceipt} disabled={scanning}>
                  <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.scanGradient}>
                    <Ionicons name="camera" size={22} color="#fff" />
                    <Text style={styles.scanButtonText}>{isRo ? 'Cameră' : 'Camera'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {scanning && (
              <View style={styles.scanningContainer}>
                <ActivityIndicator size="large" color={C.purple} />
                <Text style={styles.scanningText}>{isRo ? 'AI procesează...' : 'AI processing...'}</Text>
              </View>
            )}

            {receipts.map((receipt) => (
              <View key={receipt.id} style={styles.receiptCard}>
                <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.receiptGradient}>
                  <View style={styles.receiptHeader}>
                    <View>
                      <Text style={styles.receiptStore}>
                        {receipt.parsed_data?.store || (isRo ? 'Magazin necunoscut' : 'Unknown store')}
                      </Text>
                      <Text style={styles.receiptDate}>
                        {receipt.parsed_data?.date || format(new Date(receipt.created_at), 'dd/MM/yyyy')}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteReceipt(receipt.id)}>
                      <Ionicons name="trash-outline" size={22} color={C.red} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.receiptTotal}>
                    <Text style={styles.receiptTotalLabel}>{t('organize.total')}</Text>
                    <Text style={styles.receiptTotalValue}>
                      {receipt.parsed_data?.total || '0'} {currencySymbol}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            ))}

            {receipts.length === 0 && !scanning && (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color={C.textMuted} />
                <Text style={styles.emptyText}>{t('organize.noReceipts')}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Edit Category Modal */}
      <Modal visible={editCategoryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient colors={['#1E1E2A', '#0F0F14']} style={styles.modalGradient}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingCategory ? getCategoryName(editingCategory.name) : ''}
                </Text>
                <TouchableOpacity onPress={() => setEditCategoryModal(false)}>
                  <Ionicons name="close" size={24} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>{isRo ? 'Buget categorie' : 'Category budget'} ({currencySymbol})</Text>
                <TextInput
                  style={styles.input}
                  value={categoryBudgetAmount}
                  onChangeText={setCategoryBudgetAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={C.textMuted}
                />
                
                <Text style={styles.inputLabel}>{isRo ? 'Sumă cheltuită' : 'Amount spent'} ({currencySymbol})</Text>
                <TextInput
                  style={styles.input}
                  value={categorySpent}
                  onChangeText={setCategorySpent}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={C.textMuted}
                />
                <TouchableOpacity style={styles.saveButton} onPress={updateCategory}>
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.saveGradient}>
                    <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Edit Total Budget Modal */}
      <Modal visible={editTotalBudgetModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient colors={['#1E1E2A', '#0F0F14']} style={styles.modalGradient}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('organize.editBudget')}</Text>
                <TouchableOpacity onPress={() => setEditTotalBudgetModal(false)}>
                  <Ionicons name="close" size={24} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>{isRo ? 'Buget total' : 'Total budget'} ({currencySymbol})</Text>
                <TextInput
                  style={styles.input}
                  value={totalBudgetInput}
                  onChangeText={setTotalBudgetInput}
                  keyboardType="numeric"
                  placeholder={totalBudget.toString()}
                  placeholderTextColor={C.textMuted}
                />
                <TouchableOpacity style={styles.saveButton} onPress={updateTotalBudget}>
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.saveGradient}>
                    <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.surface,
    gap: 6,
  },
  tabActive: {
    backgroundColor: C.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  budgetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editBudgetButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.greenGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: C.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: C.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.blue,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 8,
    textAlign: 'right',
  },
  addTaskContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  addTaskInput: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: C.text,
    borderWidth: 1,
    borderColor: C.border,
  },
  addTaskButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  addTaskGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskItem: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  taskGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  taskText: {
    flex: 1,
    fontSize: 15,
    color: C.text,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: C.textMuted,
  },
  budgetSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  budgetItem: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 11,
    color: C.textMuted,
    textTransform: 'uppercase',
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginTop: 4,
  },
  categoryCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  categoryGradient: {
    padding: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  categorySpent: {
    fontSize: 14,
    color: C.textSecondary,
  },
  categoryProgress: {
    height: 6,
    backgroundColor: C.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  scanButtons: {
    marginTop: 16,
  },
  scanButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  scanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  scanningContainer: {
    alignItems: 'center',
    padding: 32,
  },
  scanningText: {
    marginTop: 12,
    fontSize: 15,
    color: C.textMuted,
  },
  receiptCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  receiptGradient: {
    padding: 16,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  receiptStore: {
    fontSize: 16,
    fontWeight: '600',
    color: C.text,
  },
  receiptDate: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 2,
  },
  receiptTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  receiptTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSecondary,
  },
  receiptTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: C.green,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: C.textMuted,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: C.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  saveButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  saveGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
