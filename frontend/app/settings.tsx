import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSettings, LANGUAGES, CURRENCIES } from '../src/context/SettingsContext';
import { useAuth } from '../src/context/AuthContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    language, 
    setLanguageCode, 
    currency, 
    setCurrencyCode, 
    currencySymbol,
    t,
    notifications,
    setNotificationPreference,
    colors: C,
    isDarkMode,
    toggleTheme,
  } = useSettings();
  
  const isRo = language.code === 'ro';
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  const handleExportData = () => {
    Alert.alert(
      t('settings.exportData'),
      t('settings.exportHint'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.confirm'), 
          onPress: () => {
            Alert.alert(t('common.success'), isRo ? 'Export inițiat' : 'Export initiated');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('settings.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* User Profile Section */}
        <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={28} color={C.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Mom'}</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          </View>
        </LinearGradient>

        {/* Language & Currency Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
          
          {/* Language Selector */}
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => setLanguageModalVisible(true)}
          >
            <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.settingGradient}>
              <View style={[styles.settingIcon, { backgroundColor: C.purpleGlow }]}>
                <Ionicons name="globe-outline" size={20} color={C.purple} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{t('settings.language')}</Text>
                <Text style={styles.settingHint}>{t('settings.languageHint')}</Text>
              </View>
              <View style={styles.settingValue}>
                <Text style={styles.settingValueText}>{language.flag} {language.name}</Text>
                <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Currency Selector */}
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => setCurrencyModalVisible(true)}
          >
            <LinearGradient colors={isDarkMode ? ['#252532', '#1E1E2A'] : ['#F8F9FA', '#FFFFFF']} style={[styles.settingGradient, !isDarkMode && { borderWidth: 1, borderColor: C.border }]}>
              <View style={[styles.settingIcon, { backgroundColor: C.greenGlow }]}>
                <Ionicons name="wallet-outline" size={20} color={C.green} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: C.text }]}>{t('settings.currency')}</Text>
                <Text style={[styles.settingHint, { color: C.textMuted }]}>{t('settings.currencyHint')}</Text>
              </View>
              <View style={styles.settingValue}>
                <Text style={[styles.settingValueText, { color: C.textSecondary }]}>{currencySymbol} {currency.code}</Text>
                <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Day/Night Mode Toggle */}
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={toggleTheme}
          >
            <LinearGradient colors={isDarkMode ? ['#252532', '#1E1E2A'] : ['#F8F9FA', '#FFFFFF']} style={[styles.settingGradient, !isDarkMode && { borderWidth: 1, borderColor: C.border }]}>
              <View style={[styles.settingIcon, { backgroundColor: isDarkMode ? C.goldGlow : C.purpleGlow }]}>
                <Ionicons 
                  name={isDarkMode ? 'sunny' : 'moon'} 
                  size={20} 
                  color={isDarkMode ? C.gold : C.purple} 
                />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: C.text }]}>
                  {isRo ? 'Mod Zi/Noapte' : 'Day/Night Mode'}
                </Text>
                <Text style={[styles.settingHint, { color: C.textMuted }]}>
                  {isDarkMode 
                    ? (isRo ? 'Activ: Mod Noapte 🌙' : 'Active: Night Mode 🌙')
                    : (isRo ? 'Activ: Mod Zi ☀️' : 'Active: Day Mode ☀️')}
                </Text>
              </View>
              <View style={[styles.themeToggle, { backgroundColor: isDarkMode ? C.gold : C.purple }]}>
                <Ionicons 
                  name={isDarkMode ? 'moon' : 'sunny'} 
                  size={16} 
                  color="#fff" 
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
          
          {/* Hydration Reminders */}
          <View style={styles.settingRow}>
            <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.settingGradient}>
              <View style={[styles.settingIcon, { backgroundColor: C.blueGlow }]}>
                <Ionicons name="water-outline" size={20} color={C.blue} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{t('settings.hydrationReminders')}</Text>
                <Text style={styles.settingHint}>{t('settings.hydrationHint')}</Text>
              </View>
              <Switch
                value={notifications.hydrationReminders}
                onValueChange={(val) => setNotificationPreference('hydrationReminders', val)}
                trackColor={{ false: C.border, true: C.primaryGlow }}
                thumbColor={notifications.hydrationReminders ? C.primary : C.textMuted}
              />
            </LinearGradient>
          </View>

          {/* Work Calendar Alerts */}
          <View style={styles.settingRow}>
            <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.settingGradient}>
              <View style={[styles.settingIcon, { backgroundColor: C.purpleGlow }]}>
                <Ionicons name="calendar-outline" size={20} color={C.purple} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{t('settings.workCalendarAlerts')}</Text>
                <Text style={styles.settingHint}>{t('settings.workCalendarHint')}</Text>
              </View>
              <Switch
                value={notifications.workCalendarAlerts}
                onValueChange={(val) => setNotificationPreference('workCalendarAlerts', val)}
                trackColor={{ false: C.border, true: C.primaryGlow }}
                thumbColor={notifications.workCalendarAlerts ? C.primary : C.textMuted}
              />
            </LinearGradient>
          </View>

          {/* Food Expiration Alerts */}
          <View style={styles.settingRow}>
            <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.settingGradient}>
              <View style={[styles.settingIcon, { backgroundColor: C.goldGlow }]}>
                <Ionicons name="fast-food-outline" size={20} color={C.gold} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{t('settings.foodExpirationAlerts')}</Text>
                <Text style={styles.settingHint}>{t('settings.foodExpirationHint')}</Text>
              </View>
              <Switch
                value={notifications.foodExpirationAlerts}
                onValueChange={(val) => setNotificationPreference('foodExpirationAlerts', val)}
                trackColor={{ false: C.border, true: C.primaryGlow }}
                thumbColor={notifications.foodExpirationAlerts ? C.primary : C.textMuted}
              />
            </LinearGradient>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.myAccount')}</Text>
          
          <TouchableOpacity style={styles.settingRow}>
            <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.settingGradient}>
              <View style={[styles.settingIcon, { backgroundColor: C.primaryGlow }]}>
                <Ionicons name="mail-outline" size={20} color={C.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{t('settings.changeEmail')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.settingGradient}>
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Ionicons name="lock-closed-outline" size={20} color={C.red} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{t('settings.changePassword')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={handleExportData}>
            <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.settingGradient}>
              <View style={[styles.settingIcon, { backgroundColor: C.greenGlow }]}>
                <Ionicons name="download-outline" size={20} color={C.green} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{t('settings.exportData')}</Text>
                <Text style={styles.settingHint}>{t('settings.exportHint')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.subscription')}</Text>
          
          {/* Monthly Plan */}
          <TouchableOpacity style={styles.subscriptionCard}>
            <LinearGradient colors={['#252532', '#1E1E2A']} style={styles.subscriptionGradient}>
              <View style={styles.subscriptionHeader}>
                <Text style={styles.subscriptionName}>{t('settings.monthlyPlan')}</Text>
                <View style={styles.priceTag}>
                  <Text style={styles.priceAmount}>{currencySymbol}4.99</Text>
                  <Text style={styles.pricePeriod}>{t('settings.perMonth')}</Text>
                </View>
              </View>
              <Text style={styles.trialText}>{t('settings.freeTrial')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Yearly Plan */}
          <TouchableOpacity style={styles.subscriptionCard}>
            <LinearGradient colors={['#E91E9C', '#B8157A']} style={styles.subscriptionGradient}>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>{t('settings.savePercent', { percent: '30' })}</Text>
              </View>
              <View style={styles.subscriptionHeader}>
                <Text style={[styles.subscriptionName, { color: '#fff' }]}>{t('settings.yearlyPlan')}</Text>
                <View style={[styles.priceTag, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={[styles.priceAmount, { color: '#fff' }]}>{currencySymbol}39.99</Text>
                  <Text style={[styles.pricePeriod, { color: 'rgba(255,255,255,0.8)' }]}>{t('settings.perYear')}</Text>
                </View>
              </View>
              <Text style={[styles.trialText, { color: 'rgba(255,255,255,0.9)' }]}>{t('settings.freeTrial')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>© 2026 MomManager by Diana-Elena Albu</Text>
        
        {/* Legal Links */}
        <View style={styles.legalLinks}>
          <TouchableOpacity onPress={() => router.push('/legal/terms')}>
            <Text style={styles.legalLink}>Terms & Conditions</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}>•</Text>
          <TouchableOpacity onPress={() => router.push('/legal/privacy')}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.copyrightFull}>
          All rights reserved. Unauthorized reproduction prohibited.
        </Text>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal visible={languageModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient colors={['#1E1E2A', '#0F0F14']} style={styles.modalGradient}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('settings.selectLanguage')}</Text>
                <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                  <Ionicons name="close" size={24} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.optionRow,
                      language.code === lang.code && styles.optionRowActive,
                    ]}
                    onPress={() => {
                      setLanguageCode(lang.code);
                      setLanguageModalVisible(false);
                    }}
                  >
                    <Text style={styles.optionFlag}>{lang.flag}</Text>
                    <Text style={[
                      styles.optionText,
                      language.code === lang.code && styles.optionTextActive,
                    ]}>
                      {lang.name}
                    </Text>
                    {language.code === lang.code && (
                      <Ionicons name="checkmark-circle" size={24} color={C.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Currency Selection Modal */}
      <Modal visible={currencyModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient colors={['#1E1E2A', '#0F0F14']} style={styles.modalGradient}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('settings.selectCurrency')}</Text>
                <TouchableOpacity onPress={() => setCurrencyModalVisible(false)}>
                  <Ionicons name="close" size={24} color={C.textMuted} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                {CURRENCIES.map((curr) => (
                  <TouchableOpacity
                    key={curr.code}
                    style={[
                      styles.optionRow,
                      currency.code === curr.code && styles.optionRowActive,
                    ]}
                    onPress={() => {
                      setCurrencyCode(curr.code);
                      setCurrencyModalVisible(false);
                    }}
                  >
                    <View style={styles.currencySymbolBox}>
                      <Text style={styles.currencySymbolText}>{curr.symbol}</Text>
                    </View>
                    <View style={styles.currencyInfo}>
                      <Text style={[
                        styles.optionText,
                        currency.code === curr.code && styles.optionTextActive,
                      ]}>
                        {curr.name}
                      </Text>
                      <Text style={styles.currencyCode}>{curr.code}</Text>
                    </View>
                    {currency.code === curr.code && (
                      <Ionicons name="checkmark-circle" size={24} color={C.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingLeft: 4,
  },
  settingRow: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  settingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingHint: {
    fontSize: 12,
    marginTop: 2,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValueText: {
    fontSize: 13,
  },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },
  subscriptionGradient: {
    padding: 16,
  },
  saveBadge: {
    position: 'absolute',
    top: 10,
    right: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '700',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 2,
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  pricePeriod: {
    fontSize: 11,
  },
  trialText: {
    fontSize: 13,
    marginTop: 8,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 16,
    fontWeight: '600',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  legalLink: {
    fontSize: 12,
    fontWeight: '500',
  },
  legalSeparator: {
    fontSize: 12,
  },
  copyrightFull: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: 8,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    maxHeight: '70%',
  },
  modalGradient: {
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    padding: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  optionRowActive: {
  },
  optionFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  optionTextActive: {
    fontWeight: '600',
  },
  currencySymbolBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currencySymbolText: {
    fontSize: 18,
    fontWeight: '700',
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 12,
    marginTop: 2,
  },
});
