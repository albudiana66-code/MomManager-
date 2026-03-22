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

type TabType = 'checklist' | 'budget' | 'receipts';

const dateLocales: { [key: string]: any } = {
  ro: ro, en: enUS, 'en-US': enUS, es: es, fr: fr, de: de,
};

export default function OrganizeScreen() {
  const { t, currencySymbol, language, colors: C, isDarkMode } = useSettings();

  const [activeTab, setActiveTab] = useState<TabType>('checklist');
  const [refreshing, setRefreshing] = useState(false);
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const currentMonth = format(today, 'yyyy-MM');
  const dateLocale = dateLocales[language.code] || dateLocales[language.code.split('-')[0]] || enUS;

  const gradCard = isDarkMode ? ['#252532', '#1E1E2A'] as const : ['#F8F9FA', '#FFFFFF'] as const;
  const gradModal = isDarkMode ? ['#1E1E2A', '#0F0F14'] as const : ['#F8F9FA', '#E5E7EB'] as const;
  const borderStyle = !isDarkMode ? { borderWidth: 1, borderColor: C.border } : {};

  const getCategoryName = (key: string) => {
    const categoryMap: { [key: string]: string } = {
      'Alimente': t('organize.categories.food'),
      'Utilitati': t('organize.categories.utilities'),
      'Transport': t('organize.categories.transport'),
      'Sanatate': t('organize.categories.health'),
      'Educatie': t('organize.categories.education'),
      'Divertisment': t('organize.categories.entertainment'),
    };
    return categoryMap[key] || key;
  };

  const DEFAULT_CATEGORIES = [
    { name: 'Alimente', budget: 2000, spent: 0 },
    { name: 'Utilitati', budget: 800, spent: 0 },
    { name: 'Transport', budget: 500, spent: 0 },
    { name: 'Sanatate', budget: 300, spent: 0 },
    { name: 'Educatie', budget: 400, spent: 0 },
    { name: 'Divertisment', budget: 300, spent: 0 },
  ];

  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [budget, setBudget] = useState<any>(null);
  const [editCategoryModal, setEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categorySpent, setCategorySpent] = useState('');
  const [categoryBudgetAmount, setCategoryBudgetAmount] = useState('');
  const [editTotalBudgetModal, setEditTotalBudgetModal] = useState(false);
  const [totalBudgetInput, setTotalBudgetInput] = useState('');
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
        const newBudget = await api.saveBudget({ month: currentMonth, categories: DEFAULT_CATEGORIES });
        setBudget(newBudget);
      }
      setReceipts(receiptsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => { loadData(); }, []);
  const onRefresh = useCallback(async () => { setRefreshing(true); await loadData(); setRefreshing(false); }, []);

  const addTask = async () => {
    if (!newTask.trim()) return;
    const newItem = { id: uuidv4(), text: newTask.trim(), completed: false };
    const updatedItems = [...checklistItems, newItem];
    setChecklistItems(updatedItems);
    setNewTask('');
    try { await api.saveChecklist({ date: todayStr, items: updatedItems }); } catch (error) { console.error('Error saving checklist:', error); }
  };

  const toggleTask = async (id: string) => {
    const updatedItems = checklistItems.map((item) => item.id === id ? { ...item, completed: !item.completed } : item);
    setChecklistItems(updatedItems);
    try { await api.saveChecklist({ date: todayStr, items: updatedItems }); } catch (error) { console.error('Error updating checklist:', error); }
  };

  const deleteTask = async (id: string) => {
    const updatedItems = checklistItems.filter((item) => item.id !== id);
    setChecklistItems(updatedItems);
    try { await api.saveChecklist({ date: todayStr, items: updatedItems }); } catch (error) { console.error('Error deleting task:', error); }
  };

  const updateCategory = async () => {
    if (!editingCategory) return;
    const spent = parseFloat(categorySpent) || 0;
    const newBudgetAmt = parseFloat(categoryBudgetAmount) || editingCategory.budget;
    const updatedCategories = budget.categories.map((cat: any) =>
      cat.name === editingCategory.name ? { ...cat, spent, budget: newBudgetAmt } : cat
    );
    setBudget({ ...budget, categories: updatedCategories });
    setEditCategoryModal(false);
    try { await api.saveBudget({ month: currentMonth, categories: updatedCategories }); } catch (error) { console.error('Error updating budget:', error); }
  };

  const updateTotalBudget = async () => {
    const newTotal = parseFloat(totalBudgetInput);
    if (!newTotal || newTotal <= 0) {
      Alert.alert(t('common.error'), t('common.error'));
      return;
    }
    const currentTotal = budget.categories.reduce((sum: number, cat: any) => sum + cat.budget, 0);
    const ratio = newTotal / currentTotal;
    const updatedCategories = budget.categories.map((cat: any) => ({ ...cat, budget: Math.round(cat.budget * ratio) }));
    setBudget({ ...budget, categories: updatedCategories });
    setEditTotalBudgetModal(false);
    try { await api.saveBudget({ month: currentMonth, categories: updatedCategories }); } catch (error) { console.error('Error updating total budget:', error); }
  };

  const scanReceipt = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('common.error'), t('common.error'));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.5 });
      if (!result.canceled && result.assets[0].base64) {
        setScanning(true);
        try {
          const receipt = await api.scanReceipt(result.assets[0].base64);
          setReceipts([receipt, ...receipts]);
          Alert.alert(t('common.success'), t('common.success'));
        } catch (error) {
          Alert.alert(t('common.error'), t('common.error'));
        } finally {
          setScanning(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const deleteReceipt = async (id: string) => {
    try { await api.deleteReceipt(id); setReceipts(receipts.filter((r) => r.id !== id)); } catch (error) { console.error('Error deleting receipt:', error); }
  };

  const totalBudget = budget?.categories.reduce((sum: number, cat: any) => sum + cat.budget, 0) || 0;
  const totalSpent = budget?.categories.reduce((sum: number, cat: any) => sum + cat.spent, 0) || 0;
  const completedTasks = checklistItems.filter((i) => i.completed).length;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: C.bg }]} data-testid="organize-screen">
      {/* Tab Buttons */}
      <View style={[s.tabContainer]}>
        {[
          { key: 'checklist' as TabType, icon: 'checkbox', label: t('organize.checklist'), color: C.blue },
          { key: 'budget' as TabType, icon: 'wallet', label: t('organize.budget'), color: C.green },
          { key: 'receipts' as TabType, icon: 'receipt', label: t('organize.receipts'), color: C.purple },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[s.tab, { backgroundColor: C.surface }, activeTab === tab.key && { backgroundColor: C.primary }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons name={tab.icon as any} size={18} color={activeTab === tab.key ? '#fff' : tab.color} />
            <Text style={[s.tabText, { color: C.textSecondary }, activeTab === tab.key && { color: '#fff' }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}>
        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <View>
            <LinearGradient colors={gradCard} style={[s.headerCard, borderStyle]}>
              <Text style={[s.headerTitle, { color: C.text }]}>{t('organize.dailyChecklist')}</Text>
              <Text style={[s.headerSubtitle, { color: C.textMuted }]}>{format(today, 'EEEE, d MMMM', { locale: dateLocale })}</Text>
              <View style={s.progressContainer}>
                <View style={[s.progressBar, { backgroundColor: C.border }]}>
                  <View style={[s.progressFill, { backgroundColor: C.blue, width: `${checklistItems.length ? (completedTasks / checklistItems.length) * 100 : 0}%` }]} />
                </View>
                <Text style={[s.progressText, { color: C.textMuted }]}>{completedTasks}/{checklistItems.length} {t('organize.complete')}</Text>
              </View>
            </LinearGradient>

            <View style={s.addTaskContainer}>
              <TextInput style={[s.addTaskInput, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]} value={newTask} onChangeText={setNewTask} placeholder={t('organize.addTask')} placeholderTextColor={C.textMuted} onSubmitEditing={addTask} />
              <TouchableOpacity style={s.addTaskButton} onPress={addTask}>
                <LinearGradient colors={['#3B82F6', '#2563EB']} style={s.addTaskGradient}>
                  <Ionicons name="add" size={24} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Quick Add Categories - vertical buttons that toggle their own list */}
            <View style={{ gap: 12, marginBottom: 16 }}>
              {[
                { key: 'cleaning', icon: 'sparkles-outline' as any, color: '#8B5CF6', label: t('checklist.cleaning'), items: [
                  t('checklist.cleanBedroom'), t('checklist.cleanBathroom'),
                  t('checklist.cleanKitchen'), t('checklist.vacuum'), t('checklist.mopFloors'),
                ]},
                { key: 'food', icon: 'cart-outline' as any, color: '#10B981', label: t('checklist.food'), items: [
                  t('checklist.milk'), t('checklist.bread'),
                  t('checklist.fruits'), t('checklist.meat'), t('checklist.eggs'),
                ]},
                { key: 'personal', icon: 'heart-outline' as any, color: '#EC4899', label: t('checklist.personalCare'), items: [
                  t('checklist.shampoo'), t('checklist.soap'),
                  t('checklist.cream'), t('checklist.deodorant'), t('checklist.toothpaste'),
                ]},
              ].map((cat) => {
                const catItems = checklistItems.filter((item) => item.category === cat.key);
                const isExpanded = activeCategory === cat.key;
                const completedCat = catItems.filter((i) => i.completed).length;
                return (
                  <View key={cat.key}>
                    <TouchableOpacity
                      style={[s.categoryBtn, { backgroundColor: C.surface, borderColor: isExpanded ? cat.color : C.border }]}
                      onPress={() => setActiveCategory(isExpanded ? null : cat.key)}
                      data-testid={`quick-add-${cat.key}`}
                    >
                      <View style={[s.categoryBtnIcon, { backgroundColor: `${cat.color}15` }]}>
                        <Ionicons name={cat.icon} size={20} color={cat.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.categoryBtnLabel, { color: C.text }]}>{cat.label}</Text>
                        {catItems.length > 0 && (
                          <Text style={[s.categoryBtnCount, { color: C.textMuted }]}>{completedCat}/{catItems.length} {t('organize.complete')}</Text>
                        )}
                      </View>
                      {catItems.length === 0 ? (
                        <TouchableOpacity
                          style={[s.categoryAddBtn, { backgroundColor: cat.color }]}
                          onPress={() => {
                            const newItems = cat.items.map((task) => ({ id: uuidv4(), text: task, completed: false, category: cat.key }));
                            const updated = [...checklistItems, ...newItems];
                            setChecklistItems(updated);
                            setActiveCategory(cat.key);
                            api.saveChecklist({ date: todayStr, items: updated }).catch(console.error);
                          }}
                        >
                          <Ionicons name="add" size={18} color="#fff" />
                        </TouchableOpacity>
                      ) : (
                        <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={C.textMuted} />
                      )}
                    </TouchableOpacity>

                    {isExpanded && catItems.length > 0 && (
                      <View style={{ marginTop: 6, gap: 6, paddingLeft: 8 }}>
                        {catItems.map((item) => (
                          <TouchableOpacity key={item.id} style={s.taskItem} onPress={() => toggleTask(item.id)}>
                            <LinearGradient colors={gradCard} style={[s.taskGradient, borderStyle]}>
                              <Ionicons name={item.completed ? 'checkbox' : 'square-outline'} size={22} color={item.completed ? cat.color : C.textMuted} />
                              <Text style={[s.taskText, { color: C.text }, item.completed && { textDecorationLine: 'line-through', color: C.textMuted }]}>{item.text}</Text>
                              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                                <Ionicons name="close-circle" size={20} color={C.red} />
                              </TouchableOpacity>
                            </LinearGradient>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Uncategorized items (manually added) */}
            {checklistItems.filter((i) => !i.category).length > 0 && (
              <View style={{ marginBottom: 8 }}>
                <Text style={[s.sectionMiniTitle, { color: C.textMuted }]}>{t('organize.addTask')}</Text>
                {checklistItems.filter((i) => !i.category).map((item) => (
                  <TouchableOpacity key={item.id} style={s.taskItem} onPress={() => toggleTask(item.id)}>
                    <LinearGradient colors={gradCard} style={[s.taskGradient, borderStyle]}>
                      <Ionicons name={item.completed ? 'checkbox' : 'square-outline'} size={24} color={item.completed ? C.green : C.textMuted} />
                      <Text style={[s.taskText, { color: C.text }, item.completed && { textDecorationLine: 'line-through', color: C.textMuted }]}>{item.text}</Text>
                      <TouchableOpacity onPress={() => deleteTask(item.id)}>
                        <Ionicons name="close-circle" size={22} color={C.red} />
                      </TouchableOpacity>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && budget && (
          <View>
            <LinearGradient colors={gradCard} style={[s.headerCard, borderStyle]}>
              <View style={s.budgetHeaderRow}>
                <Text style={[s.headerTitle, { color: C.text }]}>{t('organize.familyBudget')}</Text>
                <TouchableOpacity style={[s.editBudgetButton, { backgroundColor: C.greenGlow }]} onPress={() => { setTotalBudgetInput(totalBudget.toString()); setEditTotalBudgetModal(true); }}>
                  <Ionicons name="pencil" size={16} color={C.green} />
                </TouchableOpacity>
              </View>
              <Text style={[s.headerSubtitle, { color: C.textMuted }]}>{format(today, 'MMMM yyyy', { locale: dateLocale })}</Text>
              <View style={[s.budgetSummary, { borderTopColor: C.border }]}>
                <View style={s.budgetItem}>
                  <Text style={[s.budgetLabel, { color: C.textMuted }]}>{t('organize.totalBudget')}</Text>
                  <Text style={[s.budgetValue, { color: C.text }]}>{totalBudget} {currencySymbol}</Text>
                </View>
                <View style={s.budgetItem}>
                  <Text style={[s.budgetLabel, { color: C.textMuted }]}>{t('organize.spent')}</Text>
                  <Text style={[s.budgetValue, { color: C.red }]}>{totalSpent} {currencySymbol}</Text>
                </View>
                <View style={s.budgetItem}>
                  <Text style={[s.budgetLabel, { color: C.textMuted }]}>{t('organize.remaining')}</Text>
                  <Text style={[s.budgetValue, { color: C.green }]}>{totalBudget - totalSpent} {currencySymbol}</Text>
                </View>
              </View>
            </LinearGradient>

            {budget.categories.map((cat: any) => {
              const percentage = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0;
              const isOver = percentage > 100;
              return (
                <TouchableOpacity key={cat.name} style={s.categoryCard} onPress={() => { setEditingCategory(cat); setCategorySpent(cat.spent.toString()); setCategoryBudgetAmount(cat.budget.toString()); setEditCategoryModal(true); }}>
                  <LinearGradient colors={gradCard} style={[s.categoryGradient, borderStyle]}>
                    <View style={s.categoryHeader}>
                      <Text style={[s.categoryName, { color: C.text }]}>{getCategoryName(cat.name)}</Text>
                      <Text style={[s.categorySpent, { color: C.textSecondary }, isOver && { color: C.red }]}>{cat.spent} / {cat.budget} {currencySymbol}</Text>
                    </View>
                    <View style={[s.categoryProgress, { backgroundColor: C.border }]}>
                      <View style={[s.categoryProgressFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: isOver ? C.red : C.green }]} />
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
            <LinearGradient colors={gradCard} style={[s.headerCard, borderStyle]}>
              <Text style={[s.headerTitle, { color: C.text }]}>{t('organize.scannedReceipts')}</Text>
              <Text style={[s.headerSubtitle, { color: C.textMuted }]}>{t('organize.scanReceiptsHint')}</Text>
              <View style={s.scanButtons}>
                <TouchableOpacity style={s.scanButton} onPress={scanReceipt} disabled={scanning}>
                  <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={s.scanGradient}>
                    <Ionicons name="camera" size={22} color="#fff" />
                    <Text style={s.scanButtonText}>{t('organize.camera')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {scanning && (
              <View style={s.scanningContainer}>
                <ActivityIndicator size="large" color={C.purple} />
                <Text style={[s.scanningText, { color: C.textMuted }]}>{t('organize.processingAI')}</Text>
              </View>
            )}

            {receipts.map((receipt) => (
              <View key={receipt.id} style={s.receiptCard}>
                <LinearGradient colors={gradCard} style={[s.receiptGradient, borderStyle]}>
                  <View style={s.receiptHeader}>
                    <View>
                      <Text style={[s.receiptStore, { color: C.text }]}>{receipt.parsed_data?.store || (t('organize.unknownStore'))}</Text>
                      <Text style={[s.receiptDate, { color: C.textMuted }]}>{receipt.parsed_data?.date || format(new Date(receipt.created_at), 'dd/MM/yyyy')}</Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteReceipt(receipt.id)}>
                      <Ionicons name="trash-outline" size={22} color={C.red} />
                    </TouchableOpacity>
                  </View>
                  <View style={[s.receiptTotal, { borderTopColor: C.border }]}>
                    <Text style={[s.receiptTotalLabel, { color: C.textSecondary }]}>{t('organize.total')}</Text>
                    <Text style={[s.receiptTotalValue, { color: C.green }]}>{receipt.parsed_data?.total || '0'} {currencySymbol}</Text>
                  </View>
                </LinearGradient>
              </View>
            ))}

            {receipts.length === 0 && !scanning && (
              <View style={s.emptyState}>
                <Ionicons name="receipt-outline" size={48} color={C.textMuted} />
                <Text style={[s.emptyText, { color: C.textMuted }]}>{t('organize.noReceipts')}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Edit Category Modal */}
      <Modal visible={editCategoryModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <LinearGradient colors={gradModal} style={s.modalGradient}>
              <View style={[s.modalHeader, { borderBottomColor: C.border }]}>
                <Text style={[s.modalTitle, { color: C.text }]}>{editingCategory ? getCategoryName(editingCategory.name) : ''}</Text>
                <TouchableOpacity onPress={() => setEditCategoryModal(false)}>
                  <Ionicons name="close" size={24} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={s.modalBody}>
                <Text style={[s.inputLabel, { color: C.textSecondary }]}>{t('organize.categoryBudget')} ({currencySymbol})</Text>
                <TextInput style={[s.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]} value={categoryBudgetAmount} onChangeText={setCategoryBudgetAmount} keyboardType="numeric" placeholder="0" placeholderTextColor={C.textMuted} />
                <Text style={[s.inputLabel, { color: C.textSecondary }]}>{t('organize.spentAmount')} ({currencySymbol})</Text>
                <TextInput style={[s.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]} value={categorySpent} onChangeText={setCategorySpent} keyboardType="numeric" placeholder="0" placeholderTextColor={C.textMuted} />
                <TouchableOpacity style={s.saveButton} onPress={updateCategory}>
                  <LinearGradient colors={['#10B981', '#059669']} style={s.saveGradient}>
                    <Text style={s.saveButtonText}>{t('common.save')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Edit Total Budget Modal */}
      <Modal visible={editTotalBudgetModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <LinearGradient colors={gradModal} style={s.modalGradient}>
              <View style={[s.modalHeader, { borderBottomColor: C.border }]}>
                <Text style={[s.modalTitle, { color: C.text }]}>{t('organize.editBudget')}</Text>
                <TouchableOpacity onPress={() => setEditTotalBudgetModal(false)}>
                  <Ionicons name="close" size={24} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={s.modalBody}>
                <Text style={[s.inputLabel, { color: C.textSecondary }]}>{t('organize.setBudget')} ({currencySymbol})</Text>
                <TextInput style={[s.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]} value={totalBudgetInput} onChangeText={setTotalBudgetInput} keyboardType="numeric" placeholder={totalBudget.toString()} placeholderTextColor={C.textMuted} />
                <TouchableOpacity style={s.saveButton} onPress={updateTotalBudget}>
                  <LinearGradient colors={['#10B981', '#059669']} style={s.saveGradient}>
                    <Text style={s.saveButtonText}>{t('common.save')}</Text>
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

const s = StyleSheet.create({
  container: { flex: 1 },
  tabContainer: { flexDirection: 'row', padding: 16, gap: 8 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 14, gap: 6 },
  tabText: { fontSize: 12, fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  headerCard: { borderRadius: 20, padding: 20, marginBottom: 16 },
  budgetHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  editBudgetButton: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  headerSubtitle: { fontSize: 14, marginTop: 4, textTransform: 'capitalize' },
  progressContainer: { marginTop: 16 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 13, marginTop: 8, textAlign: 'right' },
  addTaskContainer: { flexDirection: 'row', marginBottom: 16, gap: 12 },
  addTaskInput: { flex: 1, borderRadius: 14, padding: 14, fontSize: 16, borderWidth: 1 },
  addTaskButton: { borderRadius: 14, overflow: 'hidden' },
  addTaskGradient: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
  taskItem: { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  taskGradient: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  taskText: { flex: 1, fontSize: 15 },
  categoryBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1.5, gap: 12 },
  categoryBtnIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  categoryBtnLabel: { fontSize: 15, fontWeight: '600' },
  categoryBtnCount: { fontSize: 12, marginTop: 2 },
  categoryAddBtn: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionMiniTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  budgetSummary: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1 },
  budgetItem: { alignItems: 'center' },
  budgetLabel: { fontSize: 11, textTransform: 'uppercase' },
  budgetValue: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  categoryCard: { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  categoryGradient: { padding: 16 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryName: { fontSize: 15, fontWeight: '600' },
  categorySpent: { fontSize: 14 },
  categoryProgress: { height: 6, borderRadius: 3, overflow: 'hidden' },
  categoryProgressFill: { height: '100%', borderRadius: 3 },
  scanButtons: { marginTop: 16 },
  scanButton: { borderRadius: 14, overflow: 'hidden' },
  scanGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  scanButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  scanningContainer: { alignItems: 'center', padding: 32 },
  scanningText: { marginTop: 12, fontSize: 15 },
  receiptCard: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  receiptGradient: { padding: 16 },
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  receiptStore: { fontSize: 16, fontWeight: '600' },
  receiptDate: { fontSize: 13, marginTop: 2 },
  receiptTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  receiptTotalLabel: { fontSize: 14, fontWeight: '600' },
  receiptTotalValue: { fontSize: 16, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 15, marginTop: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  modalGradient: { padding: 0 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalBody: { padding: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderRadius: 14, padding: 14, fontSize: 16, marginBottom: 16, borderWidth: 1 },
  saveButton: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  saveGradient: { paddingVertical: 16, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
