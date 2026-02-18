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

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

// Theme colors
const GOLD = '#C5A059';
const GOLD_LIGHT = '#D4B87A';
const GOLD_MUTED = 'rgba(197, 160, 89, 0.15)';
const TEXT_DARK = '#3D2B1F';
const TEXT_SECONDARY = '#6B5D52';
const TEXT_MUTED = '#9C8B7E';
const BG_CREAM = '#F5F5DC';
const BG_LIGHT = '#FAF8F0';

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
    // Subtle pulse animation - elegant, not distracting
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    if (visible && messages.length === 0) {
      // Welcome message
      const welcomeMessages: { [key: string]: string } = {
        ro: 'Bună, dragă mamă! 💛 Sunt asistentul tău personal. Cum te pot ajuta astăzi? Sunt aici să te ascult și să te sprijin în organizarea zilei tale.',
        en: 'Hello, dear mom! 💛 I\'m your personal assistant. How can I help you today? I\'m here to listen and support you in organizing your day.',
        es: '¡Hola, querida mamá! 💛 Soy tu asistente personal. ¿Cómo puedo ayudarte hoy?',
        fr: 'Bonjour, chère maman! 💛 Je suis votre assistante personnelle. Comment puis-je vous aider aujourd\'hui?',
        de: 'Hallo, liebe Mama! 💛 Ich bin deine persönliche Assistentin. Wie kann ich dir heute helfen?',
        it: 'Ciao, cara mamma! 💛 Sono la tua assistente personale. Come posso aiutarti oggi?',
      };
      
      const langCode = language.code.split('-')[0];
      const welcomeText = welcomeMessages[langCode] || welcomeMessages['en'];
      
      setMessages([{
        id: '1',
        text: welcomeText,
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
        headers: {
          'Content-Type': 'application/json',
        },
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
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'I\'m sorry, I encountered an issue. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I\'m sorry, I couldn\'t process your message. Please try again. 💛',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <>
      {/* Floating Chat Button - Luxury Gold */}
      <Animated.View style={[styles.floatingButton, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => setVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses" size={26} color="#FFFFFF" />
          <View style={styles.aiLabel}>
            <Text style={styles.aiLabelText}>AI</Text>
          </View>
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
                  <View style={styles.avatarContainer}>
                    <Ionicons name="heart" size={22} color={GOLD} />
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>{t('ai.assistant')}</Text>
                    <Text style={styles.headerSubtitle}>{t('ai.alwaysHere')} 💛</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={TEXT_SECONDARY} />
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
                    style={[
                      styles.messageBubble,
                      message.isUser ? styles.userBubble : styles.aiBubble,
                    ]}
                  >
                    {!message.isUser && (
                      <View style={styles.aiAvatar}>
                        <Ionicons name="heart" size={14} color={GOLD} />
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
                      <Ionicons name="heart" size={14} color={GOLD} />
                    </View>
                    <View style={styles.typingIndicator}>
                      <ActivityIndicator size="small" color={GOLD} />
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
                  placeholderTextColor={TEXT_MUTED}
                  multiline
                  maxLength={1000}
                  onSubmitEditing={sendMessage}
                />
                <TouchableOpacity
                  style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                  onPress={sendMessage}
                  disabled={!inputText.trim() || isLoading}
                >
                  <Ionicons name="send" size={18} color="#FFFFFF" />
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
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    // Elegant shadow - no glow
    shadowColor: '#3D2B1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  aiLabel: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: TEXT_DARK,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aiLabelText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(61, 43, 31, 0.4)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chatContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '85%',
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E4D9',
    backgroundColor: BG_LIGHT,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GOLD_MUTED,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_DARK,
    fontFamily: 'PlayfairDisplay_600SemiBold',
  },
  headerSubtitle: {
    fontSize: 13,
    color: GOLD,
  },
  closeButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: BG_CREAM,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GOLD_MUTED,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#3D2B1F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  userMessageContent: {
    backgroundColor: GOLD,
  },
  messageText: {
    fontSize: 15,
    color: TEXT_DARK,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  typingText: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E4D9',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: BG_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXT_DARK,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E8E4D9',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3D2B1F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: GOLD_MUTED,
  },
});
