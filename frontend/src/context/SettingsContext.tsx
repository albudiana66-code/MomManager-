import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import roTranslations from '../translations/ro.json';
import enTranslations from '../translations/en.json';
import esTranslations from '../translations/es.json';
import frTranslations from '../translations/fr.json';
import deTranslations from '../translations/de.json';

// All translations
const translations: { [key: string]: any } = {
  ro: roTranslations,
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  de: deTranslations,
};

// All world languages with their regions and currencies
export const LANGUAGES = [
  { code: 'ro', name: 'Română', region: 'RO', currency: 'RON', currencySymbol: 'lei' },
  { code: 'en', name: 'English (UK)', region: 'GB', currency: 'GBP', currencySymbol: '£' },
  { code: 'en-US', name: 'English (US)', region: 'US', currency: 'USD', currencySymbol: '$' },
  { code: 'es', name: 'Español', region: 'ES', currency: 'EUR', currencySymbol: '€' },
  { code: 'fr', name: 'Français', region: 'FR', currency: 'EUR', currencySymbol: '€' },
  { code: 'de', name: 'Deutsch', region: 'DE', currency: 'EUR', currencySymbol: '€' },
  { code: 'it', name: 'Italiano', region: 'IT', currency: 'EUR', currencySymbol: '€' },
  { code: 'pt', name: 'Português', region: 'PT', currency: 'EUR', currencySymbol: '€' },
  { code: 'pt-BR', name: 'Português (Brasil)', region: 'BR', currency: 'BRL', currencySymbol: 'R$' },
  { code: 'nl', name: 'Nederlands', region: 'NL', currency: 'EUR', currencySymbol: '€' },
  { code: 'pl', name: 'Polski', region: 'PL', currency: 'PLN', currencySymbol: 'zł' },
  { code: 'ru', name: 'Русский', region: 'RU', currency: 'RUB', currencySymbol: '₽' },
  { code: 'uk', name: 'Українська', region: 'UA', currency: 'UAH', currencySymbol: '₴' },
  { code: 'cs', name: 'Čeština', region: 'CZ', currency: 'CZK', currencySymbol: 'Kč' },
  { code: 'hu', name: 'Magyar', region: 'HU', currency: 'HUF', currencySymbol: 'Ft' },
  { code: 'bg', name: 'Български', region: 'BG', currency: 'BGN', currencySymbol: 'лв' },
  { code: 'hr', name: 'Hrvatski', region: 'HR', currency: 'EUR', currencySymbol: '€' },
  { code: 'sk', name: 'Slovenčina', region: 'SK', currency: 'EUR', currencySymbol: '€' },
  { code: 'sl', name: 'Slovenščina', region: 'SI', currency: 'EUR', currencySymbol: '€' },
  { code: 'sr', name: 'Srpski', region: 'RS', currency: 'RSD', currencySymbol: 'дин' },
  { code: 'el', name: 'Ελληνικά', region: 'GR', currency: 'EUR', currencySymbol: '€' },
  { code: 'tr', name: 'Türkçe', region: 'TR', currency: 'TRY', currencySymbol: '₺' },
  { code: 'ar', name: 'العربية', region: 'SA', currency: 'SAR', currencySymbol: '﷼' },
  { code: 'he', name: 'עברית', region: 'IL', currency: 'ILS', currencySymbol: '₪' },
  { code: 'hi', name: 'हिन्दी', region: 'IN', currency: 'INR', currencySymbol: '₹' },
  { code: 'th', name: 'ไทย', region: 'TH', currency: 'THB', currencySymbol: '฿' },
  { code: 'vi', name: 'Tiếng Việt', region: 'VN', currency: 'VND', currencySymbol: '₫' },
  { code: 'id', name: 'Bahasa Indonesia', region: 'ID', currency: 'IDR', currencySymbol: 'Rp' },
  { code: 'ms', name: 'Bahasa Melayu', region: 'MY', currency: 'MYR', currencySymbol: 'RM' },
  { code: 'tl', name: 'Filipino', region: 'PH', currency: 'PHP', currencySymbol: '₱' },
  { code: 'zh', name: '中文 (简体)', region: 'CN', currency: 'CNY', currencySymbol: '¥' },
  { code: 'zh-TW', name: '中文 (繁體)', region: 'TW', currency: 'TWD', currencySymbol: 'NT$' },
  { code: 'ja', name: '日本語', region: 'JP', currency: 'JPY', currencySymbol: '¥' },
  { code: 'ko', name: '한국어', region: 'KR', currency: 'KRW', currencySymbol: '₩' },
  { code: 'sv', name: 'Svenska', region: 'SE', currency: 'SEK', currencySymbol: 'kr' },
  { code: 'no', name: 'Norsk', region: 'NO', currency: 'NOK', currencySymbol: 'kr' },
  { code: 'da', name: 'Dansk', region: 'DK', currency: 'DKK', currencySymbol: 'kr' },
  { code: 'fi', name: 'Suomi', region: 'FI', currency: 'EUR', currencySymbol: '€' },
  { code: 'sw', name: 'Kiswahili', region: 'KE', currency: 'KES', currencySymbol: 'KSh' },
  { code: 'zu', name: 'isiZulu', region: 'ZA', currency: 'ZAR', currencySymbol: 'R' },
  { code: 'af', name: 'Afrikaans', region: 'ZA', currency: 'ZAR', currencySymbol: 'R' },
];

interface SettingsContextType {
  language: typeof LANGUAGES[0];
  setLanguageCode: (code: string) => void;
  currencySymbol: string;
  formatCurrency: (amount: number) => string;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Helper function to get nested translation
const getNestedValue = (obj: any, path: string): string => {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path; // Return key if translation not found
    }
  }
  return typeof result === 'string' ? result : path;
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(LANGUAGES[0]); // Default to Romanian

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('language');
      if (savedLang) {
        const lang = LANGUAGES.find(l => l.code === savedLang);
        if (lang) setLanguage(lang);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const setLanguageCode = async (code: string) => {
    const lang = LANGUAGES.find(l => l.code === code);
    if (lang) {
      setLanguage(lang);
      await AsyncStorage.setItem('language', code);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} ${language.currencySymbol}`;
  };

  // Translation function
  const t = (key: string): string => {
    // Get base language code (e.g., 'en' from 'en-US')
    const baseLang = language.code.split('-')[0];
    
    // Try exact language first, then base language, then fallback to English, then Romanian
    const translationSource = 
      translations[language.code] || 
      translations[baseLang] || 
      translations['en'] || 
      translations['ro'];
    
    return getNestedValue(translationSource, key);
  };

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguageCode,
        currencySymbol: language.currencySymbol,
        formatCurrency,
        t,
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
