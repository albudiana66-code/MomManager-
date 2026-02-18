import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useSettings } from '../../src/context/SettingsContext';
import { api } from '../../src/utils/api';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { AIChatButton } from '../../src/components/AIChatButton';
import { LanguageSelector } from '../../src/components/LanguageSelector';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { language, currencySymbol } = useSettings();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [todayMeetings, setTodayMeetings] = useState<any[]>([]);
  const [todayChecklist, setTodayChecklist] = useState<any>(null);
  const [kidsCount, setKidsCount] = useState(0);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const loadData = async () => {
    try {
      const [meetings, checklists, kids] = await Promise.all([
        api.getMeetings(),
        api.getChecklists(todayStr),
        api.getKids(),
      ]);

      setTodayMeetings(meetings.filter((m: any) => m.date === todayStr));
      setTodayChecklist(checklists[0] || null);
      setKidsCount(kids.length);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

  const completedTasks = todayChecklist?.items?.filter((i: any) => i.completed).length || 0;
  const totalTasks = todayChecklist?.items?.length || 0;

  const quickActions = [
    { icon: 'add-circle', label: 'Întâlnire', route: '/(tabs)/work', color: '#6366f1' },
    { icon: 'list', label: 'Checklist', route: '/(tabs)/organize', color: '#10b981' },
    { icon: 'fast-food', label: 'Meal Plan', route: '/(tabs)/kitchen', color: '#f59e0b' },
    { icon: 'fitness', label: 'Workout', route: '/(tabs)/selfcare', color: '#ec4899' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ec4899" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bună, {user?.name?.split(' ')[0]}!</Text>
            <Text style={styles.date}>
              {format(today, "EEEE, d MMMM", { locale: ro })}
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={22} color="#9d174d" />
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={22} color="#9d174d" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Language & Currency Info */}
        <View style={styles.langCard}>
          <Ionicons name="globe-outline" size={18} color="#ec4899" />
          <Text style={styles.langText}>{language.name}</Text>
          <View style={styles.currencyBadge}>
            <Text style={styles.currencyText}>{currencySymbol}</Text>
          </View>
        </View>

        {/* Today Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Rezumatul zilei</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#e0e7ff' }]}>
                <Ionicons name="calendar" size={24} color="#6366f1" />
              </View>
              <Text style={styles.summaryValue}>{todayMeetings.length}</Text>
              <Text style={styles.summaryLabel}>Întâlniri</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#d1fae5' }]}>
                <Ionicons name="checkbox" size={24} color="#10b981" />
              </View>
              <Text style={styles.summaryValue}>{completedTasks}/{totalTasks}</Text>
              <Text style={styles.summaryLabel}>Taskuri</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: '#fce7f3' }]}>
                <Ionicons name="people" size={24} color="#ec4899" />
              </View>
              <Text style={styles.summaryValue}>{kidsCount}</Text>
              <Text style={styles.summaryLabel}>Copii</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Acțiuni rapide</Text>
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickAction}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                <Ionicons name={action.icon as any} size={28} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Meetings */}
        {todayMeetings.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Întâlniri azi</Text>
            {todayMeetings.slice(0, 3).map((meeting) => (
              <View key={meeting.id} style={styles.meetingItem}>
                <View style={[styles.meetingDot, { backgroundColor: meeting.color }]} />
                <View style={styles.meetingInfo}>
                  <Text style={styles.meetingTitle}>{meeting.title}</Text>
                  <Text style={styles.meetingTime}>
                    {meeting.start_time} - {meeting.end_time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Today's Tasks */}
        {todayChecklist && todayChecklist.items?.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Taskuri azi</Text>
            {todayChecklist.items.slice(0, 4).map((item: any) => (
              <View key={item.id} style={styles.taskItem}>
                <Ionicons
                  name={item.completed ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={item.completed ? '#10b981' : '#9ca3af'}
                />
                <Text
                  style={[
                    styles.taskText,
                    item.completed && styles.taskCompleted,
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Motivational Quote */}
        <View style={styles.quoteCard}>
          <Ionicons name="sparkles" size={24} color="#ec4899" />
          <Text style={styles.quoteText}>
            "O mamă organizată este o mamă fericită!"
          </Text>
        </View>
      </ScrollView>

      {/* AI Chat Button */}
      <AIChatButton />

      {/* Settings Modal */}
      <Modal visible={settingsVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Setări</Text>
              <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.settingsLabel}>Limbă și monedă</Text>
              <LanguageSelector />
              <Text style={styles.settingsHint}>
                Moneda se schimbă automat în funcție de limba selectată
              </Text>
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
    backgroundColor: '#fdf2f8',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#9d174d',
  },
  date: {
    fontSize: 16,
    color: '#be185d',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9d174d',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  quickAction: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  sectionCard: {
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
  meetingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  meetingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  meetingTime: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  taskText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  quoteCard: {
    backgroundColor: '#fce7f3',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  quoteText: {
    flex: 1,
    fontSize: 15,
    fontStyle: 'italic',
    color: '#9d174d',
  },
});
