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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  const { t, language, colors: C, isDarkMode } = useSettings();
  const gradCard = isDarkMode ? ['#252532', '#1E1E2A'] as const : ['#F8F9FA', '#FFFFFF'] as const;
  const gradModal = isDarkMode ? ['#1E1E2A', '#0F0F14'] as const : ['#F8F9FA', '#E5E7EB'] as const;
  const borderStyle = !isDarkMode ? { borderWidth: 1, borderColor: C.border } : {};
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemTime, setNewItemTime] = useState('09:00');
  const [newItemType, setNewItemType] = useState<PlannerItem['type']>('meeting');

  // Me-Time state
  const [meTimeLoading, setMeTimeLoading] = useState(false);
  const [meTimeSuggestions, setMeTimeSuggestions] = useState<any[]>([]);
  const [meTimeModal, setMeTimeModal] = useState(false);

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
          color: C.primary,
        });
      }
      await loadPlannerItems();
      setAddModalVisible(false);
      setNewItemTitle('');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const deleteItem = async (item: PlannerItem) => {
    if (item.aiGenerated) return;
    const msg = language.code === 'ro' ? 'Esti sigura ca vrei sa stergi?' : 'Are you sure you want to delete?';
    if (typeof window !== 'undefined' && !window.confirm(msg)) return;
    try {
      if (item.type === 'meeting') {
        await api.deleteMeeting(item.id);
      }
      await loadPlannerItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const fetchMeTimeSuggestions = async () => {
    setMeTimeLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const meetings = plannerItems.filter(i => i.type === 'meeting').map(i => ({
        title: i.title,
        start_time: i.time,
        end_time: i.time,
      }));
      const result = await api.getMeTimeSuggestions({
        date: dateStr,
        meetings,
        language: language.code,
      });
      setMeTimeSuggestions(result.suggestions || []);
      setMeTimeModal(true);
    } catch (error) {
      console.error('Error getting me-time suggestions:', error);
    } finally {
      setMeTimeLoading(false);
    }
  };

  const addMeTimeToCalendar = async (suggestion: any) => {
    try {
      await api.createMeeting({
        title: suggestion.suggestion,
        date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: suggestion.start,
        end_time: suggestion.end,
        description: suggestion.detail || '',
        color: '#E91E9C',
      });
      await loadPlannerItems();
      setMeTimeModal(false);
    } catch (error) {
      console.error('Error adding me-time:', error);
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
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]} data-testid="work-screen">
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: C.text }]}>AI Smart Planner</Text>
            <Text style={[styles.subtitle, { color: C.textMuted }]}>
              {language.code === 'ro' ? 'Asistentul tau de organizare' : 'Your organizing assistant'}
            </Text>
          </View>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: C.primary }]} onPress={() => setAddModalVisible(true)}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* AI Insight Card */}
        <View style={[styles.aiCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[styles.aiIconContainer, { backgroundColor: C.primaryGlow }]}>
            <Ionicons name="sparkles" size={24} color={C.primary} />
          </View>
          <View style={styles.aiContent}>
            <Text style={[styles.aiTitle, { color: C.text }]}>
              {language.code === 'ro' ? 'Insight AI' : 'AI Insight'}
            </Text>
            <Text style={[styles.aiText, { color: C.textMuted }]}>
              {language.code === 'ro' 
                ? 'Intreaba-ma orice in chat si voi completa calendarul automat pentru tine.'
                : 'Ask me anything in chat and I\'ll fill your calendar automatically.'}
            </Text>
          </View>
        </View>

        {/* Month Display */}
        <Text style={[styles.monthText, { color: C.text }]}>
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
                        <Text style={[styles.itemTitle, { color: C.text }]}>{item.title}</Text>
                        {item.aiGenerated && (
                          <View style={styles.aiBadge}>
                            <Ionicons name="sparkles" size={10} color={C.primary} />
                            <Text style={[styles.aiBadgeText, { color: C.primary }]}>AI</Text>
                          </View>
                        )}
                      </View>
                      {item.description && (
                        <Text style={[styles.itemDescription, { color: C.textMuted }]}>{item.description}</Text>
                      )}
                    </View>
                    {!item.aiGenerated && (
                      <TouchableOpacity onPress={() => deleteItem(item)} style={{ padding: 8 }}>
                        <Ionicons name="trash-outline" size={18} color={C.red || '#EF4444'} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* AI Me-Time Suggestions */}
        <TouchableOpacity activeOpacity={0.85} onPress={fetchMeTimeSuggestions} disabled={meTimeLoading} data-testid="me-time-btn">
          <LinearGradient colors={['#E91E9C', '#B8157A']} style={styles.selfCareCard}>
            <View style={styles.selfCareIcon}>
              <Ionicons name={meTimeLoading ? 'hourglass' : 'sparkles'} size={24} color="#fff" />
            </View>
            <View style={styles.selfCareContent}>
              <Text style={[styles.selfCareTitle, { color: '#fff' }]}>
                {language.code === 'ro' ? 'AI Me-Time' : 'AI Me-Time'}
              </Text>
              <Text style={[styles.selfCareText, { color: 'rgba(255,255,255,0.8)' }]}>
                {meTimeLoading
                  ? (language.code === 'ro' ? 'AI analizeaza calendarul...' : 'AI analyzing schedule...')
                  : (language.code === 'ro' ? 'Gaseste timp liber pentru tine' : 'Find free time for yourself')}
              </Text>
            </View>
            {meTimeLoading && <ActivityIndicator size="small" color="#fff" />}
          </LinearGradient>
        </TouchableOpacity>

        {/* Me-Time suggestions preview */}
        {meTimeSuggestions.length > 0 && !meTimeModal && (
          <TouchableOpacity style={{ marginTop: 8, marginHorizontal: 16 }} onPress={() => setMeTimeModal(true)}>
            <View style={[styles.meTimePreview, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Ionicons name="heart" size={18} color={C.primary} />
              <Text style={[styles.meTimePreviewText, { color: C.text }]}>
                {meTimeSuggestions.length} {language.code === 'ro' ? 'sugestii disponibile' : 'suggestions available'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Me-Time Modal */}
      <Modal visible={meTimeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={[styles.modalHeader, { backgroundColor: C.bg }]}>
              <Text style={[styles.modalTitle, { color: C.text }]}>
                {language.code === 'ro' ? 'Sugestii Me-Time' : 'Me-Time Suggestions'}
              </Text>
              <TouchableOpacity onPress={() => setMeTimeModal(false)}>
                <Ionicons name="close" size={24} color={C.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ backgroundColor: C.bg, padding: 16 }}>
              {meTimeSuggestions.map((s: any, i: number) => {
                const catIcons: any = { beauty: 'color-palette', wellness: 'leaf', fun: 'cafe', books: 'book' };
                const catColors: any = { beauty: C.primary, wellness: C.green, fun: C.gold, books: C.purple };
                return (
                  <View key={i} style={[styles.meTimeCard, { backgroundColor: C.surface }]}>
                    <View style={styles.meTimeCardHeader}>
                      <View style={[styles.meTimeIconCircle, { backgroundColor: `${catColors[s.category] || C.primary}20` }]}>
                        <Ionicons name={catIcons[s.category] || 'heart'} size={20} color={catColors[s.category] || C.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.meTimeName, { color: C.text }]}>{s.suggestion}</Text>
                        <Text style={[styles.meTimeTime, { color: C.textMuted }]}>{s.start} - {s.end}</Text>
                      </View>
                    </View>
                    {s.detail && (
                      <Text style={[styles.meTimeDetail, { color: C.textSecondary }]}>{s.detail}</Text>
                    )}
                    <TouchableOpacity style={styles.meTimeAddBtn} onPress={() => addMeTimeToCalendar(s)}>
                      <LinearGradient colors={['#E91E9C', '#B8157A']} style={styles.meTimeAddGrad}>
                        <Ionicons name="add-circle" size={16} color="#fff" />
                        <Text style={styles.meTimeAddText}>
                          {language.code === 'ro' ? 'Adauga in calendar' : 'Add to calendar'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  meTimePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
  },
  meTimePreviewText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  meTimeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  meTimeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  meTimeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meTimeName: {
    fontSize: 15,
    fontWeight: '600',
  },
  meTimeTime: {
    fontSize: 12,
    marginTop: 2,
  },
  meTimeDetail: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  meTimeAddBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  meTimeAddGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  meTimeAddText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
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
