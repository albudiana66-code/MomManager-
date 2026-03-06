import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useSettings } from '../../src/context/SettingsContext';
import { api } from '../../src/utils/api';
import { format } from 'date-fns';
import { ro, enUS, es, fr, de, it } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';
const dateLocales: { [key: string]: any } = {
  ro: ro, en: enUS, 'en-US': enUS, es: es, fr: fr, de: de, it: it,
};

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { language, currencySymbol, t, colors: C, isDarkMode } = useSettings();
  const router = useRouter();
  const isRo = language.code === 'ro';
  const [refreshing, setRefreshing] = useState(false);
  const [todayMeetings, setTodayMeetings] = useState<any[]>([]);
  const [todayChecklist, setTodayChecklist] = useState<any>(null);
  const [kidsCount, setKidsCount] = useState(0);

  // AI Chat state
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<ScrollView>(null);

  const today = new Date();
  const dateLocale = dateLocales[language.code] || dateLocales[language.code.split('-')[0]] || enUS;

  const gradCard = isDarkMode ? ['#252532', '#1E1E2A'] as const : ['#F8F9FA', '#FFFFFF'] as const;

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

  useEffect(() => { loadDashboardData(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, []);

  const openChat = () => {
    if (chatMessages.length === 0) {
      const welcomeMap: { [key: string]: string } = {
        ro: 'Buna! Sunt asistentul tau AI. Cu ce te pot ajuta?',
        en: 'Hello! I\'m your AI assistant. How can I help you?',
        es: 'Hola! Soy tu asistente AI. Como puedo ayudarte?',
        fr: 'Bonjour! Je suis votre assistant AI. Comment puis-je vous aider?',
        de: 'Hallo! Ich bin dein AI Assistent. Wie kann ich dir helfen?',
        it: 'Ciao! Sono il tuo assistente AI. Come posso aiutarti?',
        pt: 'Ola! Sou o seu assistente AI. Como posso ajudar?',
      };
      const langCode = language.code.split('-')[0];
      setChatMessages([{ id: '1', text: welcomeMap[langCode] || welcomeMap['en'], isUser: false }]);
    }
    setChatVisible(true);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), text: chatInput.trim(), isUser: true };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: userMsg.text,
          language: language.code,
          history: chatMessages.slice(-10).map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text })),
        }),
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: data.response || (isRo ? 'Nu am putut procesa. Incearca din nou.' : 'Could not process. Try again.'),
        isUser: false,
      }]);
    } catch {
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: isRo ? 'Eroare de conexiune. Incearca din nou.' : 'Connection error. Try again.',
        isUser: false,
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [chatMessages]);

  const completedTasks = todayChecklist?.tasks?.filter((t: any) => t.completed).length || 0;
  const totalTasks = todayChecklist?.tasks?.length || 0;
  const borderStyle = !isDarkMode ? { borderWidth: 1, borderColor: C.border } : {};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]} data-testid="home-screen">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: C.textMuted }]}>{t('home.greeting')}</Text>
            <Text style={[styles.userName, { color: C.text }]}>{user?.name?.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: C.surface }]} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={22} color={C.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Date Card */}
        <LinearGradient colors={gradCard} style={[styles.dateCard, borderStyle]}>
          <View style={styles.dateContent}>
            <Text style={[styles.dateDay, { color: C.text }]}>{format(today, 'EEEE', { locale: dateLocale })}</Text>
            <Text style={[styles.dateNumber, { color: C.textMuted }]}>{format(today, 'd MMMM yyyy', { locale: dateLocale })}</Text>
          </View>
          <View style={[styles.dateBadge, { backgroundColor: C.goldGlow }]}>
            <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={24} color={C.gold} />
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <LinearGradient colors={gradCard} style={[styles.statCard, borderStyle]}>
            <View style={[styles.statIcon, { backgroundColor: C.primaryGlow }]}>
              <Ionicons name="videocam" size={20} color={C.primary} />
            </View>
            <Text style={[styles.statValue, { color: C.text }]}>{todayMeetings.length}</Text>
            <Text style={[styles.statLabel, { color: C.textMuted }]}>{t('home.meetings')}</Text>
          </LinearGradient>
          <LinearGradient colors={gradCard} style={[styles.statCard, borderStyle]}>
            <View style={[styles.statIcon, { backgroundColor: C.blueGlow }]}>
              <Ionicons name="checkbox" size={20} color={C.blue} />
            </View>
            <Text style={[styles.statValue, { color: C.text }]}>{completedTasks}/{totalTasks}</Text>
            <Text style={[styles.statLabel, { color: C.textMuted }]}>{t('home.tasks')}</Text>
          </LinearGradient>
          <LinearGradient colors={gradCard} style={[styles.statCard, borderStyle]}>
            <View style={[styles.statIcon, { backgroundColor: C.purpleGlow }]}>
              <Ionicons name="people" size={20} color={C.purple} />
            </View>
            <Text style={[styles.statValue, { color: C.text }]}>{kidsCount}</Text>
            <Text style={[styles.statLabel, { color: C.textMuted }]}>{t('home.children')}</Text>
          </LinearGradient>
        </View>

        {/* AI Assistant Bar - opens chat */}
        <TouchableOpacity activeOpacity={0.85} onPress={openChat} data-testid="ai-assistant-bar">
          <LinearGradient colors={['#E91E9C', '#B8157A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.aiCard}>
            <View style={styles.aiContent}>
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                <Text style={styles.aiBadgeText}>AI ASSISTANT</Text>
              </View>
              <Text style={styles.aiTitle}>
                {t('ai.hereForYou')}
              </Text>
              <Text style={styles.aiSubtitle}>
                {t('ai.tapToChat')}
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
              { icon: 'book-outline', label: t('landing.features.kids'), route: '/(tabs)/kids', color: C.purple },
              { icon: 'fitness-outline', label: t('landing.features.selfcare'), route: '/(tabs)/selfcare', color: C.green },
              { icon: 'restaurant-outline', label: t('home.mealPlan'), route: '/(tabs)/kitchen', color: C.gold },
              { icon: 'checkbox-outline', label: t('home.checklist'), route: '/(tabs)/organize', color: C.blue },
            ].map((action, index) => (
              <TouchableOpacity key={index} style={styles.actionCard} onPress={() => router.push(action.route as any)}>
                <LinearGradient colors={gradCard} style={[styles.actionGradient, borderStyle]}>
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
        <LinearGradient colors={gradCard} style={[styles.quoteCard, borderStyle]}>
          <Ionicons name="sparkles" size={20} color={C.primary} />
          <Text style={[styles.quoteText, { color: C.textSecondary }]}>"{t('home.motivationalQuote')}"</Text>
        </LinearGradient>
      </ScrollView>

      {/* AI Chat Modal - Full Screen */}
      <Modal visible={chatVisible} animationType="slide" transparent>
        <View style={[styles.chatOverlay]}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.chatKeyboard}>
            <View style={[styles.chatContainer, { backgroundColor: C.bg }]}>
              {/* Chat Header */}
              <LinearGradient colors={['#E91E9C', '#B8157A']} style={styles.chatHeader}>
                <View style={styles.chatHeaderLeft}>
                  <View style={styles.chatAvatar}>
                    <Ionicons name="sparkles" size={20} color="#E91E9C" />
                  </View>
                  <View>
                    <Text style={styles.chatHeaderTitle}>{t('ai.assistant')}</Text>
                    <Text style={styles.chatHeaderSub}>{t('ai.alwaysHere')}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setChatVisible(false)} style={styles.chatCloseBtn}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </LinearGradient>

              {/* Messages */}
              <ScrollView ref={chatScrollRef} style={styles.chatMessages} contentContainerStyle={styles.chatMessagesContent}>
                {chatMessages.map((msg) => (
                  <View key={msg.id} style={[styles.msgRow, msg.isUser && styles.msgRowUser]}>
                    {!msg.isUser && (
                      <View style={[styles.msgAvatar, { backgroundColor: C.primaryGlow }]}>
                        <Ionicons name="sparkles" size={14} color={C.primary} />
                      </View>
                    )}
                    <View style={[
                      styles.msgBubble,
                      msg.isUser
                        ? { backgroundColor: C.primary }
                        : { backgroundColor: C.surface },
                    ]}>
                      <Text style={[styles.msgText, { color: msg.isUser ? '#fff' : C.text }]}>{msg.text}</Text>
                    </View>
                  </View>
                ))}
                {chatLoading && (
                  <View style={styles.msgRow}>
                    <View style={[styles.msgAvatar, { backgroundColor: C.primaryGlow }]}>
                      <Ionicons name="sparkles" size={14} color={C.primary} />
                    </View>
                    <View style={[styles.msgBubble, { backgroundColor: C.surface }]}>
                      <ActivityIndicator size="small" color={C.primary} />
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Input */}
              <View style={[styles.chatInputRow, { backgroundColor: C.bg, borderTopColor: C.border }]}>
                <TextInput
                  style={[styles.chatInput, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]}
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder={t('ai.placeholder')}
                  placeholderTextColor={C.textMuted}
                  multiline
                  maxLength={1000}
                  onSubmitEditing={sendChatMessage}
                />
                <TouchableOpacity
                  style={[styles.chatSendBtn, (!chatInput.trim() || chatLoading) && { opacity: 0.4 }]}
                  onPress={sendChatMessage}
                  disabled={!chatInput.trim() || chatLoading}
                >
                  <LinearGradient colors={['#E91E9C', '#B8157A']} style={styles.chatSendGradient}>
                    <Ionicons name="send" size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 14, letterSpacing: 0.5 },
  userName: { fontSize: 28, fontWeight: '700', marginTop: 4 },
  iconButton: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  dateCard: { borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  dateContent: { flex: 1 },
  dateDay: { fontSize: 22, fontWeight: '700', textTransform: 'capitalize' },
  dateNumber: { fontSize: 14, marginTop: 4, textTransform: 'capitalize' },
  dateBadge: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
  statIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  aiCard: { borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  aiContent: { flex: 1 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  aiBadgeText: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.9)', letterSpacing: 1.5 },
  aiTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  aiSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  aiIcon: { width: 60, height: 60, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14, letterSpacing: 0.3 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { width: '47%', borderRadius: 16, overflow: 'hidden' },
  actionGradient: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  actionIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionLabel: { fontSize: 14, fontWeight: '600', flex: 1 },
  quoteCard: { borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  quoteText: { flex: 1, fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  // Chat modal
  chatOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  chatKeyboard: { flex: 1, justifyContent: 'flex-end' },
  chatContainer: { height: '90%', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  chatHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  chatAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  chatHeaderTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  chatHeaderSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  chatCloseBtn: { padding: 8 },
  chatMessages: { flex: 1 },
  chatMessagesContent: { padding: 16, paddingBottom: 24 },
  msgRow: { flexDirection: 'row', marginBottom: 14, maxWidth: '85%' },
  msgRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  msgAvatar: { width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  msgBubble: { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12, maxWidth: '100%' },
  msgText: { fontSize: 15, lineHeight: 22 },
  chatInputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 14, paddingBottom: 20, borderTopWidth: 1, gap: 10 },
  chatInput: { flex: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, maxHeight: 100, borderWidth: 1 },
  chatSendBtn: { borderRadius: 14, overflow: 'hidden' },
  chatSendGradient: { width: 46, height: 46, justifyContent: 'center', alignItems: 'center' },
});
