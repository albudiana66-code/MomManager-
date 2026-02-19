import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useSettings } from '../../src/context/SettingsContext';
import { api } from '../../src/utils/api';
import { format } from 'date-fns';
import { ro, enUS, es, fr, de, it } from 'date-fns/locale';
import { AIChatButton } from '../../src/components/AIChatButton';
import { LinearGradient } from 'expo-linear-gradient';

// Modern 2026 Colors
const C = {
  bg: '#F8F6F3',
  card: '#FFFFFF',
  accent: '#2C2622',
  gold: '#B8956E',
  goldLight: '#D4B896',
  goldGlow: 'rgba(184, 149, 110, 0.12)',
  text: '#1A1614',
  textSecondary: '#6B635B',
  textMuted: '#9E958C',
  border: '#E8E4DE',
  success: '#6B8E6B',
};

const dateLocales: { [key: string]: any } = {
  ro: ro, en: enUS, 'en-US': enUS, es: es, fr: fr, de: de, it: it,
};

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { language, currencySymbol, t } = useSettings();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [todayMeetings, setTodayMeetings] = useState<any[]>([]);
  const [todayChecklist, setTodayChecklist] = useState<any>(null);
  const [kidsCount, setKidsCount] = useState(0);

  const today = new Date();
  const dateLocale = dateLocales[language.code] || dateLocales[language.code.split('-')[0]] || enUS;

  const loadDashboardData = async () => {
    try {
      const todayStr = format(today, 'yyyy-MM-dd');
      const [meetings, checklist, kids] = await Promise.all([
        api.getMeetings(),
        api.getChecklist(todayStr),
        api.getKids(),
      ]);

      const todaysMeetings = meetings.filter((m: any) => m.date === todayStr);
      setTodayMeetings(todaysMeetings);
      setTodayChecklist(checklist);
      setKidsCount(kids.length);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, []);

  const completedTasks = todayChecklist?.tasks?.filter((t: any) => t.completed).length || 0;
  const totalTasks = todayChecklist?.tasks?.length || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('home.greeting')},</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0]}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings-outline" size={22} color={C.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Card */}
        <View style={styles.dateCard}>
          <View style={styles.dateContent}>
            <Text style={styles.dateDay}>
              {format(today, 'EEEE', { locale: dateLocale })}
            </Text>
            <Text style={styles.dateNumber}>
              {format(today, 'd MMMM yyyy', { locale: dateLocale })}
            </Text>
          </View>
          <View style={styles.dateBadge}>
            <Ionicons name="sunny-outline" size={20} color={C.gold} />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: C.goldGlow }]}>
              <Ionicons name="videocam-outline" size={20} color={C.gold} />
            </View>
            <Text style={styles.statValue}>{todayMeetings.length}</Text>
            <Text style={styles.statLabel}>{t('home.meetings')}</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: C.goldGlow }]}>
              <Ionicons name="checkbox-outline" size={20} color={C.gold} />
            </View>
            <Text style={styles.statValue}>{completedTasks}/{totalTasks}</Text>
            <Text style={styles.statLabel}>{t('home.tasks')}</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: C.goldGlow }]}>
              <Ionicons name="people-outline" size={20} color={C.gold} />
            </View>
            <Text style={styles.statValue}>{kidsCount}</Text>
            <Text style={styles.statLabel}>{t('home.children')}</Text>
          </View>
        </View>

        {/* AI Insight Card */}
        <TouchableOpacity style={styles.aiCard} activeOpacity={0.95}>
          <LinearGradient
            colors={['#3D352F', '#2C2622']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiGradient}
          >
            <View style={styles.aiContent}>
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={14} color={C.gold} />
                <Text style={styles.aiBadgeText}>AI ASSISTANT</Text>
              </View>
              <Text style={styles.aiTitle}>
                {language.code === 'ro' 
                  ? 'Sunt aici pentru tine' 
                  : 'I\'m here for you'}
              </Text>
              <Text style={styles.aiSubtitle}>
                {language.code === 'ro'
                  ? 'Întreabă-mă orice despre ziua ta'
                  : 'Ask me anything about your day'}
              </Text>
            </View>
            <View style={styles.aiIcon}>
              <Ionicons name="chatbubble-ellipses" size={28} color={C.gold} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Today's Schedule */}
        {todayMeetings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language.code === 'ro' ? 'Programul de azi' : 'Today\'s Schedule'}
            </Text>
            {todayMeetings.slice(0, 3).map((meeting, index) => (
              <View key={meeting.id || index} style={styles.scheduleCard}>
                <View style={styles.scheduleTime}>
                  <Text style={styles.timeText}>{meeting.start_time}</Text>
                </View>
                <View style={styles.scheduleLine} />
                <View style={styles.scheduleContent}>
                  <Text style={styles.scheduleTitle}>{meeting.title}</Text>
                  {meeting.description && (
                    <Text style={styles.scheduleDesc}>{meeting.description}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: 'add-circle-outline', label: t('home.meeting'), route: '/(tabs)/work' },
              { icon: 'list-outline', label: t('home.checklist'), route: '/(tabs)/organize' },
              { icon: 'restaurant-outline', label: t('home.mealPlan'), route: '/(tabs)/kitchen' },
              { icon: 'heart-outline', label: t('home.workout'), route: '/(tabs)/selfcare' },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={() => router.push(action.route as any)}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name={action.icon as any} size={22} color={C.gold} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Motivational Quote */}
        <View style={styles.quoteCard}>
          <Ionicons name="sparkles" size={20} color={C.gold} />
          <Text style={styles.quoteText}>"{t('home.motivationalQuote')}"</Text>
        </View>
      </ScrollView>

      {/* AI Chat Button */}
      <AIChatButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: C.textMuted,
  },
  userName: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: C.text,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A1614',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  dateCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#1A1614',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 6,
  },
  dateContent: {
    flex: 1,
  },
  dateDay: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    color: C.text,
    textTransform: 'capitalize',
  },
  dateNumber: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  dateBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.goldGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#1A1614',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
  },
  statLabel: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#1A1614',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  aiGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiContent: {
    flex: 1,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.gold,
    letterSpacing: 1.5,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  aiSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  aiIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(184, 149, 110, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scheduleTime: {
    width: 50,
    paddingTop: 4,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMuted,
  },
  scheduleLine: {
    width: 2,
    height: '100%',
    minHeight: 50,
    backgroundColor: C.gold,
    borderRadius: 1,
    marginHorizontal: 12,
  },
  scheduleContent: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#1A1614',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  scheduleDesc: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#1A1614',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.goldGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
    flex: 1,
  },
  quoteCard: {
    backgroundColor: C.goldGlow,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(184, 149, 110, 0.2)',
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    color: C.text,
    lineHeight: 20,
  },
});
