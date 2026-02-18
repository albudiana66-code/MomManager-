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
  } = useSettings();
  
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
            // TODO: Implement data export
            Alert.alert(t('common.success'), 'Data export initiated');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#C5A059" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('settings.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* User Profile Section */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={32} color="#ec4899" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Mom'}</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          </View>
        </View>

        {/* Language & Currency Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
          
          {/* Language Selector */}
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => setLanguageModalVisible(true)}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="globe-outline" size={22} color="#6366f1" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>{t('settings.language')}</Text>
              <Text style={styles.settingHint}>{t('settings.languageHint')}</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>{language.flag} {language.name}</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>
          </TouchableOpacity>

          {/* Currency Selector */}
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => setCurrencyModalVisible(true)}
          >
            <View style={styles.settingIcon}>
              <Ionicons name="wallet-outline" size={22} color="#10b981" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>{t('settings.currency')}</Text>
              <Text style={styles.settingHint}>{t('settings.currencyHint')}</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>{currencySymbol} {currency.code}</Text>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
          
          {/* Hydration Reminders */}
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="water-outline" size={22} color="#3b82f6" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>{t('settings.hydrationReminders')}</Text>
              <Text style={styles.settingHint}>{t('settings.hydrationHint')}</Text>
            </View>
            <Switch
              value={notifications.hydrationReminders}
              onValueChange={(val) => setNotificationPreference('hydrationReminders', val)}
              trackColor={{ false: '#e5e7eb', true: '#fce7f3' }}
              thumbColor={notifications.hydrationReminders ? '#ec4899' : '#9ca3af'}
            />
          </View>

          {/* Work Calendar Alerts */}
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: '#ede9fe' }]}>
              <Ionicons name="calendar-outline" size={22} color="#8b5cf6" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>{t('settings.workCalendarAlerts')}</Text>
              <Text style={styles.settingHint}>{t('settings.workCalendarHint')}</Text>
            </View>
            <Switch
              value={notifications.workCalendarAlerts}
              onValueChange={(val) => setNotificationPreference('workCalendarAlerts', val)}
              trackColor={{ false: '#e5e7eb', true: '#fce7f3' }}
              thumbColor={notifications.workCalendarAlerts ? '#ec4899' : '#9ca3af'}
            />
          </View>

          {/* Food Expiration Alerts */}
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="fast-food-outline" size={22} color="#f59e0b" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>{t('settings.foodExpirationAlerts')}</Text>
              <Text style={styles.settingHint}>{t('settings.foodExpirationHint')}</Text>
            </View>
            <Switch
              value={notifications.foodExpirationAlerts}
              onValueChange={(val) => setNotificationPreference('foodExpirationAlerts', val)}
              trackColor={{ false: '#e5e7eb', true: '#fce7f3' }}
              thumbColor={notifications.foodExpirationAlerts ? '#ec4899' : '#9ca3af'}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.myAccount')}</Text>
          
          <TouchableOpacity style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: '#fce7f3' }]}>
              <Ionicons name="mail-outline" size={22} color="#ec4899" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>{t('settings.changeEmail')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="lock-closed-outline" size={22} color="#ef4444" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>{t('settings.changePassword')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={handleExportData}>
            <View style={[styles.settingIcon, { backgroundColor: '#d1fae5' }]}>
              <Ionicons name="download-outline" size={22} color="#10b981" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>{t('settings.exportData')}</Text>
              <Text style={styles.settingHint}>{t('settings.exportHint')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.subscription')}</Text>
          
          {/* Monthly Plan */}
          <TouchableOpacity style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <Text style={styles.subscriptionName}>{t('settings.monthlyPlan')}</Text>
              <View style={styles.priceTag}>
                <Text style={styles.priceAmount}>{currencySymbol}4.99</Text>
                <Text style={styles.pricePeriod}>{t('settings.perMonth')}</Text>
              </View>
            </View>
            <Text style={styles.trialText}>{t('settings.freeTrial')}</Text>
          </TouchableOpacity>

          {/* Yearly Plan */}
          <TouchableOpacity style={[styles.subscriptionCard, styles.subscriptionCardHighlight]}>
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
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>© 2026 MomManager by Diana-Elena Albu. All rights reserved.</Text>
        
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
          Unauthorized reproduction or distribution of this app's content, code, or design is strictly prohibited.
        </Text>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal visible={languageModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.selectLanguage')}</Text>
              <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
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
                    <Ionicons name="checkmark-circle" size={24} color="#C5A059" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Currency Selection Modal */}
      <Modal visible={currencyModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('settings.selectCurrency')}</Text>
              <TouchableOpacity onPress={() => setCurrencyModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
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
                    <Text style={styles.currencySymbol}>{curr.symbol}</Text>
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
                    <Ionicons name="checkmark-circle" size={24} color="#ec4899" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#9d174d',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9d174d',
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingLeft: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
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
    color: '#1f2937',
  },
  settingHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValueText: {
    fontSize: 13,
    color: '#6b7280',
  },
  subscriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  subscriptionCardHighlight: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saveBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#fce7f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 2,
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ec4899',
  },
  pricePeriod: {
    fontSize: 12,
    color: '#be185d',
  },
  trialText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 8,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
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
    color: '#ec4899',
    fontWeight: '500',
  },
  legalSeparator: {
    fontSize: 12,
    color: '#d1d5db',
  },
  copyrightFull: {
    textAlign: 'center',
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 8,
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 14,
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
    maxHeight: '70%',
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
    backgroundColor: '#fce7f3',
  },
  optionFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  optionTextActive: {
    fontWeight: '600',
    color: '#9d174d',
  },
  currencySymbolBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6b7280',
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
});
