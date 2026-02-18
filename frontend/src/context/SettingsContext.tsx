import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Import translations
import roTranslations from '../translations/ro.json';
import enTranslations from '../translations/en.json';
import esTranslations from '../translations/es.json';
import frTranslations from '../translations/fr.json';
import deTranslations from '../translations/de.json';
import itTranslations from '../translations/it.json';

// All translations
const translations: { [key: string]: any } = {
  ro: roTranslations,
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  de: deTranslations,
  it: itTranslations,
};

// Languages with their names
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

// All supported currencies
export const CURRENCIES = [
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

// User preferences for notifications
export interface NotificationPreferences {
  hydrationReminders: boolean;
  workCalendarAlerts: boolean;
  foodExpirationAlerts: boolean;
}

interface SettingsContextType {
  // Language
  language: typeof LANGUAGES[0];
  setLanguageCode: (code: string) => void;
  
  // Currency (independent from language)
  currency: typeof CURRENCIES[0];
  setCurrencyCode: (code: string) => void;
  currencySymbol: string;
  formatCurrency: (amount: number) => string;
  
  // Translation function
  t: (key: string, params?: { [key: string]: string | number }) => string;
  
  // Notification preferences
  notifications: NotificationPreferences;
  setNotificationPreference: (key: keyof NotificationPreferences, value: boolean) => void;
  
  // Loading state
  isSettingsLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Helper function to get nested translation value
const getNestedValue = (obj: any, path: string, params?: { [key: string]: string | number }): string => {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path; // Return key if translation not found
    }
  }
  
  if (typeof result === 'string' && params) {
    // Replace {{param}} placeholders
    return result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }
  
  return typeof result === 'string' ? result : path;
};

// Detect browser/device language and return matching language
const detectLanguage = (): typeof LANGUAGES[0] => {
  try {
    const deviceLocale = Localization.locale;
    const localeCode = deviceLocale?.split('-')[0] || 'en';
    
    // First try exact match
    const exactMatch = LANGUAGES.find(l => l.code === deviceLocale);
    if (exactMatch) return exactMatch;
    
    // Then try base language match
    const baseMatch = LANGUAGES.find(l => l.code === localeCode || l.code.startsWith(localeCode));
    if (baseMatch) return baseMatch;
    
    // Default to English
    return LANGUAGES.find(l => l.code === 'en') || LANGUAGES[0];
  } catch {
    return LANGUAGES.find(l => l.code === 'en') || LANGUAGES[0];
  }
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(LANGUAGES.find(l => l.code === 'en') || LANGUAGES[0]);
  const [currency, setCurrency] = useState(CURRENCIES.find(c => c.code === 'GBP') || CURRENCIES[0]);
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    hydrationReminders: true,
    workCalendarAlerts: true,
    foodExpirationAlerts: false,
  });
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load saved language or detect from device
      const savedLang = await AsyncStorage.getItem('app_language');
      if (savedLang) {
        const lang = LANGUAGES.find(l => l.code === savedLang);
        if (lang) setLanguage(lang);
      } else {
        // Auto-detect language from device
        const detectedLang = detectLanguage();
        setLanguage(detectedLang);
      }

      // Load saved currency
      const savedCurrency = await AsyncStorage.getItem('app_currency');
      if (savedCurrency) {
        const curr = CURRENCIES.find(c => c.code === savedCurrency);
        if (curr) setCurrency(curr);
      }

      // Load notification preferences
      const savedNotifications = await AsyncStorage.getItem('app_notifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsSettingsLoaded(true);
    }
  };

  const setLanguageCode = async (code: string) => {
    const lang = LANGUAGES.find(l => l.code === code);
    if (lang) {
      setLanguage(lang);
      await AsyncStorage.setItem('app_language', code);
    }
  };

  const setCurrencyCode = async (code: string) => {
    const curr = CURRENCIES.find(c => c.code === code);
    if (curr) {
      setCurrency(curr);
      await AsyncStorage.setItem('app_currency', code);
    }
  };

  const setNotificationPreference = async (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    await AsyncStorage.setItem('app_notifications', JSON.stringify(updated));
  };

  const formatCurrency = (amount: number) => {
    // Format with currency symbol
    if (currency.code === 'RON') {
      return `${amount.toFixed(2)} ${currency.symbol}`;
    }
    return `${currency.symbol}${amount.toFixed(2)}`;
  };

  // Translation function with fallback chain
  const t = (key: string, params?: { [key: string]: string | number }): string => {
    const baseLang = language.code.split('-')[0];
    
    // Fallback chain: exact match -> base language -> English
    const translationSource = 
      translations[language.code] || 
      translations[baseLang] || 
      translations['en'];
    
    return getNestedValue(translationSource, key, params);
  };

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguageCode,
        currency,
        setCurrencyCode,
        currencySymbol: currency.symbol,
        formatCurrency,
        t,
        notifications,
        setNotificationPreference,
        isSettingsLoaded,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
