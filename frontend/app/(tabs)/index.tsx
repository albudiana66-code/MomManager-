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

const dateLocales: { [key: string]: any } = {
  ro: ro, en: enUS, 'en-US': enUS, es: es, fr: fr, de: de, it: it,
};

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { language, currencySymbol, t, colors: C, isDarkMode, toggleTheme } = useSettings();
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
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: C.textMuted }]}>{t('home.greeting')}</Text>
            <Text style={[styles.userName, { color: C.text }]}>{user?.name?.split(' ')[0]}</Text>
          </View>
          <View style={styles.headerButtons}>
            {/* Day/Night Toggle */}
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: C.surface }]} 
              onPress={toggleTheme}
            >
              <Ionicons 
                name={isDarkMode ? 'sunny-outline' : 'moon-outline'} 
                size={22} 
                color={isDarkMode ? C.gold : C.purple} 
              />
            </TouchableOpacity>
            {/* Settings */}
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: C.surface }]} 
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings-outline" size={22} color={C.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Card */}
        <LinearGradient
          colors={isDarkMode ? ['#252532', '#1E1E2A'] : ['#F8F9FA', '#FFFFFF']}
          style={[styles.dateCard, !isDarkMode && { borderWidth: 1, borderColor: C.border }]}
        >
          <View style={styles.dateContent}>
            <Text style={[styles.dateDay, { color: C.text }]}>
              {format(today, 'EEEE', { locale: dateLocale })}
            </Text>
            <Text style={[styles.dateNumber, { color: C.textMuted }]}>
              {format(today, 'd MMMM yyyy', { locale: dateLocale })}
            </Text>
          </View>
          <View style={[styles.dateBadge, { backgroundColor: C.goldGlow }]}>
            <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={24} color={C.gold} />
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <LinearGradient colors={isDarkMode ? ['#252532', '#1E1E2A'] : ['#F8F9FA', '#FFFFFF']} style={[styles.statCard, !isDarkMode && { borderWidth: 1, borderColor: C.border }]}>
            <View style={[styles.statIcon, { backgroundColor: C.primaryGlow }]}>
              <Ionicons name="videocam" size={20} color={C.primary} />
            </View>
            <Text style={[styles.statValue, { color: C.text }]}>{todayMeetings.length}</Text>
            <Text style={[styles.statLabel, { color: C.textMuted }]}>{t('home.meetings')}</Text>
          </LinearGradient>
          
          <LinearGradient colors={isDarkMode ? ['#252532', '#1E1E2A'] : ['#F8F9FA', '#FFFFFF']} style={[styles.statCard, !isDarkMode && { borderWidth: 1, borderColor: C.border }]}>
            <View style={[styles.statIcon, { backgroundColor: C.blueGlow }]}>
              <Ionicons name="checkbox" size={20} color={C.blue} />
            </View>
            <Text style={[styles.statValue, { color: C.text }]}>{completedTasks}/{totalTasks}</Text>
            <Text style={[styles.statLabel, { color: C.textMuted }]}>{t('home.tasks')}</Text>
          </LinearGradient>
          
          <LinearGradient colors={isDarkMode ? ['#252532', '#1E1E2A'] : ['#F8F9FA', '#FFFFFF']} style={[styles.statCard, !isDarkMode && { borderWidth: 1, borderColor: C.border }]}>
            <View style={[styles.statIcon, { backgroundColor: C.purpleGlow }]}>
              <Ionicons name="people" size={20} color={C.purple} />
            </View>
            <Text style={[styles.statValue, { color: C.text }]}>{kidsCount}</Text>
            <Text style={[styles.statLabel, { color: C.textMuted }]}>{t('home.children')}</Text>
          </LinearGradient>
        </View>

        {/* AI Insight Card */}
        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient
            colors={['#E91E9C', '#B8157A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiCard}
          >
            <View style={styles.aiContent}>
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                <Text style={styles.aiBadgeText}>AI ASSISTANT</Text>
              </View>
              <Text style={styles.aiTitle}>
                {language.code === 'ro' 
                  ? 'Sunt aici pentru tine' 
                  : "I'm here for you"}
              </Text>
              <Text style={styles.aiSubtitle}>
                {language.code === 'ro'
                  ? 'Întreabă-mă orice despre ziua ta'
                  : 'Ask me anything about your day'}
              </Text>
            </View>
            <View style={styles.aiIcon}>
              <Ionicons name="chatbubble-ellipses" size={32} color="rgba(255,255,255,0.9)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>{t('home.quickActions')}</Text>
          <View style={styles.actionsGrid}>
            {[
              { icon: 'book-outline', label: language.code === 'ro' ? 'Povești AI' : 'AI Stories', route: '/(tabs)/kids', color: C.purple },
              { icon: 'fitness-outline', label: language.code === 'ro' ? 'Exerciții' : 'Workouts', route: '/(tabs)/selfcare', color: C.green },
              { icon: 'restaurant-outline', label: t('home.mealPlan'), route: '/(tabs)/kitchen', color: C.gold },
              { icon: 'checkbox-outline', label: t('home.checklist'), route: '/(tabs)/organize', color: C.blue },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={() => router.push(action.route as any)}
              >
                <LinearGradient
                  colors={isDarkMode ? ['#252532', '#1E1E2A'] : ['#F8F9FA', '#FFFFFF']}
                  style={[styles.actionGradient, !isDarkMode && { borderWidth: 1, borderColor: C.border }]}>
                  <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                    <Ionicons name={action.icon as any} size={22} color={action.color} />
                  </View>
                  <Text style={[styles.actionLabel, { color: C.text }]}>{action.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Motivational Quote */}
        <LinearGradient
          colors={isDarkMode ? ['#252532', '#1E1E2A'] : ['#F8F9FA', '#FFFFFF']}
          style={[styles.quoteCard, !isDarkMode && { borderWidth: 1, borderColor: C.border }]}
        >
          <Ionicons name="sparkles" size={20} color={C.primary} />
          <Text style={[styles.quoteText, { color: C.textSecondary }]}>"{t('home.motivationalQuote')}"</Text>
        </LinearGradient>
      </ScrollView>

      <AIChatButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  greeting: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateContent: {
    flex: 1,
  },
  dateDay: {
    fontSize: 22,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  dateNumber: {
    fontSize: 14,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  dateBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
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
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aiCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1.5,
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  aiSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  aiIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    color: C.textSecondary,
    lineHeight: 20,
  },
});
