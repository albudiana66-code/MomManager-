import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/utils/api';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ro, enUS, es, fr, de, it } from 'date-fns/locale';
import { useSettings } from '../../src/context/SettingsContext';

// Theme colors - Quiet Luxury
const COLORS = {
  background: '#FAF8F5',
  card: '#FFFFFF',
  primary: '#C5A059',
  primaryMuted: 'rgba(197, 160, 89, 0.12)',
  text: '#3D2B1F',
  textSecondary: '#5C4A3D',
  textMuted: '#8B7D70',
  border: '#E8E4DD',
};

const dateLocales: { [key: string]: any } = {
  ro: ro, en: enUS, 'en-US': enUS, es: es, fr: fr, de: de, it: it,
};

interface PlannerItem {
  id: string;
  title: string;
  time: string;
  type: 'meeting' | 'meal' | 'reminder' | 'selfcare' | 'task';
  description?: string;
  aiGenerated?: boolean;
  color?: string;
}

export default function WorkScreen() {
  const { t, language } = useSettings();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemTime, setNewItemTime] = useState('09:00');
  const [newItemType, setNewItemType] = useState<PlannerItem['type']>('meeting');

  const dateLocale = dateLocales[language.code] || dateLocales[language.code.split('-')[0]] || enUS;

  useEffect(() => {
    generateWeekDates();
  }, [selectedDate]);

  useEffect(() => {
    loadPlannerItems();
  }, [selectedDate]);

  const generateWeekDates = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    setWeekDates(dates);
  };

  const loadPlannerItems = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const [meetings, checklists] = await Promise.all([
        api.getMeetings(),
        api.getChecklist(dateStr),
      ]);

      const items: PlannerItem[] = [];

      // Add meetings
      meetings
        .filter((m: any) => m.date === dateStr)
        .forEach((m: any) => {
          items.push({
            id: m.id,
            title: m.title,
            time: m.start_time,
            type: 'meeting',
            description: m.description,
          });
        });

      // Add AI-generated reminders based on day
      const dayOfWeek = selectedDate.getDay();
      if (dayOfWeek === 3) { // Wednesday
        items.push({
          id: 'ai-recycle',
          title: language.code === 'ro' ? '♻️ Scoate coșul de reciclare' : '♻️ Take out recycling bin',
          time: '07:00',
          type: 'reminder',
          aiGenerated: true,
        });
      }
      if (dayOfWeek === 1) { // Monday
        items.push({
          id: 'ai-week-plan',
          title: language.code === 'ro' ? '📋 Planificare săptămânală' : '📋 Weekly planning',
          time: '08:00',
          type: 'task',
          aiGenerated: true,
        });
      }

      // Sort by time
      items.sort((a, b) => a.time.localeCompare(b.time));
      setPlannerItems(items);
    } catch (error) {
      console.error('Error loading planner items:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPlannerItems();
    setRefreshing(false);
  }, [selectedDate]);

  const addItem = async () => {
    if (!newItemTitle.trim()) return;

    try {
      if (newItemType === 'meeting') {
        await api.createMeeting({
          title: newItemTitle,
          date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: newItemTime,
          end_time: newItemTime,
          color: COLORS.primary,
        });
      }
      await loadPlannerItems();
      setAddModalVisible(false);
      setNewItemTitle('');
    } catch (error) {
      Alert.alert('Error', 'Could not add item');
    }
  };

  const getTypeIcon = (type: PlannerItem['type']) => {
    switch (type) {
      case 'meeting': return 'videocam-outline';
      case 'meal': return 'restaurant-outline';
      case 'reminder': return 'notifications-outline';
      case 'selfcare': return 'heart-outline';
      case 'task': return 'checkbox-outline';
      default: return 'ellipse-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>AI Smart Planner</Text>
            <Text style={styles.subtitle}>
              {language.code === 'ro' ? 'Asistentul tău de organizare' : 'Your organizing assistant'}
            </Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* AI Insight Card */}
        <View style={styles.aiCard}>
          <View style={styles.aiIconContainer}>
            <Ionicons name="sparkles" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>
              {language.code === 'ro' ? 'Insight AI' : 'AI Insight'}
            </Text>
            <Text style={styles.aiText}>
              {language.code === 'ro' 
                ? 'Întreabă-mă orice în chat și voi completa calendarul automat pentru tine.'
                : 'Ask me anything in chat and I\'ll fill your calendar automatically.'}
            </Text>
          </View>
        </View>

        {/* Month Display */}
        <Text style={styles.monthText}>
          {format(selectedDate, 'MMMM yyyy', { locale: dateLocale })}
        </Text>

        {/* Week Calendar */}
        <View style={styles.weekContainer}>
          {weekDates.map((date, index) => {
            const isSelected = isSameDay(date, selectedDate);
            const hasItems = plannerItems.some(item => true); // simplified

            return (
              <TouchableOpacity
                key={index}
                style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                  {format(date, 'EEE', { locale: dateLocale })}
                </Text>
                <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                  {format(date, 'd')}
                </Text>
                {isSelected && <View style={styles.selectedDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Planner Items */}
        <View style={styles.plannerSection}>
          <Text style={styles.sectionTitle}>
            {format(selectedDate, 'EEEE, d MMMM', { locale: dateLocale })}
          </Text>

          {plannerItems.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={40} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>
                {language.code === 'ro' ? 'Ziua ta e liberă' : 'Your day is free'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {language.code === 'ro' 
                  ? 'Întreabă AI-ul să îți planifice ceva!' 
                  : 'Ask AI to plan something for you!'}
              </Text>
            </View>
          ) : (
            <View style={styles.itemsList}>
              {plannerItems.map((item) => (
                <View key={item.id} style={styles.plannerItem}>
                  <View style={styles.itemTime}>
                    <Text style={styles.timeText}>{item.time}</Text>
                  </View>
                  <View style={styles.itemCard}>
                    <View style={styles.itemIcon}>
                      <Ionicons name={getTypeIcon(item.type)} size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.itemContent}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        {item.aiGenerated && (
                          <View style={styles.aiBadge}>
                            <Ionicons name="sparkles" size={10} color={COLORS.primary} />
                            <Text style={styles.aiBadgeText}>AI</Text>
                          </View>
                        )}
                      </View>
                      {item.description && (
                        <Text style={styles.itemDescription}>{item.description}</Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Self-Care Suggestion */}
        {plannerItems.length >= 3 && (
          <View style={styles.selfCareCard}>
            <View style={styles.selfCareIcon}>
              <Ionicons name="heart" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.selfCareContent}>
              <Text style={styles.selfCareTitle}>
                {language.code === 'ro' ? 'Sugestie Self-Care' : 'Self-Care Suggestion'}
              </Text>
              <Text style={styles.selfCareText}>
                {language.code === 'ro'
                  ? 'Ai o zi ocupată! Am rezervat 30 min pentru tine la ora 20:00 🧘‍♀️'
                  : 'You have a busy day! I\'ve blocked 30 min for you at 8PM 🧘‍♀️'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add Item Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language.code === 'ro' ? 'Adaugă în calendar' : 'Add to calendar'}
              </Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>
                {language.code === 'ro' ? 'Titlu' : 'Title'}
              </Text>
              <TextInput
                style={styles.input}
                value={newItemTitle}
                onChangeText={setNewItemTitle}
                placeholder={language.code === 'ro' ? 'Ex: Call cu clientul' : 'Ex: Client call'}
                placeholderTextColor={COLORS.textMuted}
              />

              <Text style={styles.inputLabel}>
                {language.code === 'ro' ? 'Ora' : 'Time'}
              </Text>
              <TextInput
                style={styles.input}
                value={newItemTime}
                onChangeText={setNewItemTime}
                placeholder="09:00"
                placeholderTextColor={COLORS.textMuted}
              />

              <TouchableOpacity style={styles.saveButton} onPress={addItem}>
                <Text style={styles.saveButtonText}>
                  {language.code === 'ro' ? 'Salvează' : 'Save'}
                </Text>
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
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  aiCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#3D2B1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.primaryMuted,
  },
  aiIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  aiText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  monthText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    color: COLORS.text,
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  dayButton: {
    width: 44,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  dayName: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  dayNameSelected: {
    color: '#FFFFFF',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  selectedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginTop: 6,
  },
  plannerSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    color: COLORS.text,
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  emptyState: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#3D2B1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  itemsList: {
    gap: 12,
  },
  plannerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemTime: {
    width: 50,
    paddingTop: 14,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  itemCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#3D2B1F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  itemDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  selfCareCard: {
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.25)',
  },
  selfCareIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  selfCareContent: {
    flex: 1,
  },
  selfCareTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  selfCareText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(61, 43, 31, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    color: COLORS.text,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
