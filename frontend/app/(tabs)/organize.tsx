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
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';

type TabType = 'checklist' | 'budget' | 'receipts';

const DEFAULT_CATEGORIES = [
  { name: 'Alimente', budget: 2000, spent: 0 },
  { name: 'Utilit\u0103\u021bi', budget: 800, spent: 0 },
  { name: 'Transport', budget: 500, spent: 0 },
  { name: 'S\u0103n\u0103tate', budget: 300, spent: 0 },
  { name: 'Educa\u021bie', budget: 400, spent: 0 },
  { name: 'Divertisment', budget: 300, spent: 0 },
];

export default function OrganizeScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('checklist');
  const [refreshing, setRefreshing] = useState(false);
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const currentMonth = format(today, 'yyyy-MM');

  // Checklist state
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');

  // Budget state
  const [budget, setBudget] = useState<any>(null);
  const [editCategoryModal, setEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categorySpent, setCategorySpent] = useState('');

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
  const updateCategorySpent = async () => {
    if (!editingCategory) return;

    const spent = parseFloat(categorySpent) || 0;
    const updatedCategories = budget.categories.map((cat: any) =>
      cat.name === editingCategory.name ? { ...cat, spent } : cat
    );

    setBudget({ ...budget, categories: updatedCategories });
    setEditCategoryModal(false);

    try {
      await api.saveBudget({ month: currentMonth, categories: updatedCategories });
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  // Receipt functions
  const scanReceipt = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permisiune necesar\u0103', 'Avem nevoie de acces la camer\u0103 pentru scanare');
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
          Alert.alert('Succes', 'Bonul a fost scanat \u0219i ad\u0103ugat!');
        } catch (error) {
          console.error('Error scanning receipt:', error);
          Alert.alert('Eroare', 'Nu s-a putut procesa bonul');
        } finally {
          setScanning(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const pickReceiptImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permisiune necesar\u0103', 'Avem nevoie de acces la galerie');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        base64: true,
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0].base64) {
        setScanning(true);
        try {
          const receipt = await api.scanReceipt(result.assets[0].base64);
          setReceipts([receipt, ...receipts]);
          Alert.alert('Succes', 'Bonul a fost scanat \u0219i ad\u0103ugat!');
        } catch (error) {
          console.error('Error scanning receipt:', error);
          Alert.alert('Eroare', 'Nu s-a putut procesa bonul');
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
            size={20}
            color={activeTab === 'checklist' ? '#fff' : '#10b981'}
          />
          <Text style={[styles.tabText, activeTab === 'checklist' && styles.tabTextActive]}>
            Checklist
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'budget' && styles.tabActive]}
          onPress={() => setActiveTab('budget')}
        >
          <Ionicons
            name="wallet"
            size={20}
            color={activeTab === 'budget' ? '#fff' : '#10b981'}
          />
          <Text style={[styles.tabText, activeTab === 'budget' && styles.tabTextActive]}>
            Buget
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'receipts' && styles.tabActive]}
          onPress={() => setActiveTab('receipts')}
        >
          <Ionicons
            name="receipt"
            size={20}
            color={activeTab === 'receipts' ? '#fff' : '#10b981'}
          />
          <Text style={[styles.tabText, activeTab === 'receipts' && styles.tabTextActive]}>
            Bonuri
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
      >
        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <View>
            <View style={styles.headerCard}>
              <Text style={styles.headerTitle}>Checklist Zilnic</Text>
              <Text style={styles.headerSubtitle}>
                {format(today, 'EEEE, d MMMM', { locale: ro })}
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
                  {completedTasks}/{checklistItems.length} complete
                </Text>
              </View>
            </View>

            <View style={styles.addTaskContainer}>
              <TextInput
                style={styles.addTaskInput}
                value={newTask}
                onChangeText={setNewTask}
                placeholder="Adaug\u0103 un task nou..."
                placeholderTextColor="#9ca3af"
                onSubmitEditing={addTask}
              />
              <TouchableOpacity style={styles.addTaskButton} onPress={addTask}>
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {checklistItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.taskItem}
                onPress={() => toggleTask(item.id)}
              >
                <Ionicons
                  name={item.completed ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={item.completed ? '#10b981' : '#9ca3af'}
                />
                <Text style={[styles.taskText, item.completed && styles.taskCompleted]}>
                  {item.text}
                </Text>
                <TouchableOpacity onPress={() => deleteTask(item.id)}>
                  <Ionicons name="close-circle" size={22} color="#ef4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && budget && (
          <View>
            <View style={styles.headerCard}>
              <Text style={styles.headerTitle}>Buget Familie</Text>
              <Text style={styles.headerSubtitle}>
                {format(today, 'MMMM yyyy', { locale: ro })}
              </Text>
              <View style={styles.budgetSummary}>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>Total Buget</Text>
                  <Text style={styles.budgetValue}>{totalBudget} RON</Text>
                </View>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>Cheltuit</Text>
                  <Text style={[styles.budgetValue, { color: '#ef4444' }]}>{totalSpent} RON</Text>
                </View>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>R\u0103mas</Text>
                  <Text style={[styles.budgetValue, { color: '#10b981' }]}>
                    {totalBudget - totalSpent} RON
                  </Text>
                </View>
              </View>
            </View>

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
                    setEditCategoryModal(true);
                  }}
                >
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <Text style={[styles.categorySpent, isOver && { color: '#ef4444' }]}>
                      {cat.spent} / {cat.budget} RON
                    </Text>
                  </View>
                  <View style={styles.categoryProgress}>
                    <View
                      style={[
                        styles.categoryProgressFill,
                        {
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: isOver ? '#ef4444' : '#10b981',
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Receipts Tab */}
        {activeTab === 'receipts' && (
          <View>
            <View style={styles.headerCard}>
              <Text style={styles.headerTitle}>Bonuri Scanate</Text>
              <Text style={styles.headerSubtitle}>
                Scaneaz\u0103 bonurile pentru a le ad\u0103uga automat la buget
              </Text>
              <View style={styles.scanButtons}>
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={scanReceipt}
                  disabled={scanning}
                >
                  <Ionicons name="camera" size={24} color="#fff" />
                  <Text style={styles.scanButtonText}>Camer\u0103</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.scanButton, { backgroundColor: '#6366f1' }]}
                  onPress={pickReceiptImage}
                  disabled={scanning}
                >
                  <Ionicons name="images" size={24} color="#fff" />
                  <Text style={styles.scanButtonText}>Galerie</Text>
                </TouchableOpacity>
              </View>
            </View>

            {scanning && (
              <View style={styles.scanningContainer}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.scanningText}>Se proceseaz\u0103 bonul cu AI...</Text>
              </View>
            )}

            {receipts.map((receipt) => (
              <View key={receipt.id} style={styles.receiptCard}>
                <View style={styles.receiptHeader}>
                  <View>
                    <Text style={styles.receiptStore}>
                      {receipt.parsed_data?.store || 'Magazin necunoscut'}
                    </Text>
                    <Text style={styles.receiptDate}>
                      {receipt.parsed_data?.date || format(new Date(receipt.created_at), 'dd/MM/yyyy')}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteReceipt(receipt.id)}>
                    <Ionicons name="trash-outline" size={22} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                {receipt.parsed_data?.items?.length > 0 && (
                  <View style={styles.receiptItems}>
                    {receipt.parsed_data.items.slice(0, 3).map((item: any, idx: number) => (
                      <View key={idx} style={styles.receiptItem}>
                        <Text style={styles.receiptItemName}>{item.name}</Text>
                        <Text style={styles.receiptItemPrice}>{item.price} RON</Text>
                      </View>
                    ))}
                    {receipt.parsed_data.items.length > 3 && (
                      <Text style={styles.moreItems}>
                        +{receipt.parsed_data.items.length - 3} alte produse
                      </Text>
                    )}
                  </View>
                )}
                <View style={styles.receiptTotal}>
                  <Text style={styles.receiptTotalLabel}>Total</Text>
                  <Text style={styles.receiptTotalValue}>
                    {receipt.parsed_data?.total || '0'} RON
                  </Text>
                </View>
              </View>
            ))}

            {receipts.length === 0 && !scanning && (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>Niciun bon scanat</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Edit Category Modal */}
      <Modal visible={editCategoryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Actualizeaz\u0103 {editingCategory?.name}</Text>
              <TouchableOpacity onPress={() => setEditCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Sum\u0103 cheltuit\u0103 (RON)</Text>
              <TextInput
                style={styles.input}
                value={categorySpent}
                onChangeText={setCategorySpent}
                keyboardType="numeric"
                placeholder="0"
              />
              <TouchableOpacity style={styles.saveButton} onPress={updateCategorySpent}>
                <Text style={styles.saveButtonText}>Salveaz\u0103</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecfdf5',
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
    borderRadius: 12,
    backgroundColor: '#d1fae5',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#10b981',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981',
  },
  tabTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#065f46',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#6b7280',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  addTaskButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  taskText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  budgetSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  budgetItem: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 4,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  categorySpent: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryProgress: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  scanButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  scanButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
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
    color: '#6b7280',
  },
  receiptCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  receiptStore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  receiptDate: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  receiptItems: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  receiptItemName: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  receiptItemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  moreItems: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 4,
  },
  receiptTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  receiptTotalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  receiptTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
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
  saveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
