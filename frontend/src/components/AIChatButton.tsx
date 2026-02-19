import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { LinearGradient } from 'expo-linear-gradient';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

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
};

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function AIChatButton() {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { language, t } = useSettings();

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    if (visible && messages.length === 0) {
      const welcomeMessages: { [key: string]: string } = {
        ro: 'Bună! 💛 Sunt asistentul tău AI. Pot să îți planific ziua, să îți sugerez rețete, sau doar să ascult. Cu ce te pot ajuta?',
        en: 'Hello! 💛 I\'m your AI assistant. I can help plan your day, suggest recipes, or just listen. How can I help you?',
        es: '¡Hola! 💛 Soy tu asistente AI. ¿Cómo puedo ayudarte hoy?',
        fr: 'Bonjour! 💛 Je suis votre assistant AI. Comment puis-je vous aider?',
        de: 'Hallo! 💛 Ich bin dein AI Assistent. Wie kann ich dir helfen?',
        it: 'Ciao! 💛 Sono il tuo assistente AI. Come posso aiutarti?',
      };
      
      const langCode = language.code.split('-')[0];
      setMessages([{
        id: '1',
        text: welcomeMessages[langCode] || welcomeMessages['en'],
        isUser: false,
        timestamp: new Date(),
      }]);
    }
  }, [visible, language]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage.text,
          language: language.code,
          history: messages.slice(-10).map(m => ({
            role: m.isUser ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: data.response || 'I couldn\'t process that. Please try again.',
        isUser: false,
        timestamp: new Date(),
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Connection error. Please try again. 💛',
        isUser: false,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  return (
    <>
      {/* Floating Button */}
      <Animated.View style={[styles.floatingButton, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => setVisible(true)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#3D352F', '#2C2622']}
            style={styles.buttonGradient}
          >
            <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Chat Modal */}
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.chatContainer}>
              {/* Header */}
              <View style={styles.chatHeader}>
                <View style={styles.headerLeft}>
                  <View style={styles.avatarBox}>
                    <Ionicons name="sparkles" size={18} color={C.gold} />
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>{t('ai.assistant')}</Text>
                    <Text style={styles.headerSubtitle}>Always here for you</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color={C.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Messages */}
              <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
              >
                {messages.map((message) => (
                  <View
                    key={message.id}
                    style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.aiBubble]}
                  >
                    {!message.isUser && (
                      <View style={styles.aiAvatar}>
                        <Ionicons name="sparkles" size={12} color={C.gold} />
                      </View>
                    )}
                    <View style={[styles.messageContent, message.isUser && styles.userMessageContent]}>
                      <Text style={[styles.messageText, message.isUser && styles.userMessageText]}>
                        {message.text}
                      </Text>
                    </View>
                  </View>
                ))}
                {isLoading && (
                  <View style={styles.loadingBubble}>
                    <View style={styles.aiAvatar}>
                      <Ionicons name="sparkles" size={12} color={C.gold} />
                    </View>
                    <View style={styles.typingBox}>
                      <ActivityIndicator size="small" color={C.gold} />
                      <Text style={styles.typingText}>{t('ai.typing')}</Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder={t('ai.placeholder')}
                  placeholderTextColor={C.textMuted}
                  multiline
                  maxLength={1000}
                />
                <TouchableOpacity
                  style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendDisabled]}
                  onPress={sendMessage}
                  disabled={!inputText.trim() || isLoading}
                >
                  <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    zIndex: 1000,
  },
  chatButton: {
    width: 56,
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#1A1614',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 22, 20, 0.5)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chatContainer: {
    backgroundColor: C.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '85%',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.goldGlow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: C.textMuted,
  },
  closeBtn: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: C.bg,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiBubble: {
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: C.goldGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageContent: {
    backgroundColor: C.card,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#1A1614',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  userMessageContent: {
    backgroundColor: C.accent,
  },
  messageText: {
    fontSize: 15,
    color: C.text,
    lineHeight: 21,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  typingText: {
    fontSize: 14,
    color: C.textMuted,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 14,
    paddingBottom: Platform.OS === 'ios' ? 30 : 14,
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: C.bg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: C.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendDisabled: {
    backgroundColor: C.border,
  },
});
