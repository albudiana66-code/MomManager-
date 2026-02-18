import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings, LANGUAGES } from '../context/SettingsContext';

export function LanguageSelector() {
  const { language, setLanguageCode } = useSettings();
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectLanguage = (code: string) => {
    setLanguageCode(code);
    setVisible(false);
    setSearchQuery('');
  };

  return (
    <>
      <TouchableOpacity style={styles.selector} onPress={() => setVisible(true)}>
        <View style={styles.selectorContent}>
          <Ionicons name="globe-outline" size={20} color="#ec4899" />
          <Text style={styles.selectorText}>{language.name}</Text>
          <Text style={styles.currencyBadge}>{language.currencySymbol}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selectează limba</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9ca3af" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Caută limba..."
                placeholderTextColor="#9ca3af"
              />
            </View>

            <ScrollView style={styles.languageList}>
              {filteredLanguages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageItem,
                    language.code === lang.code && styles.languageItemActive,
                  ]}
                  onPress={() => selectLanguage(lang.code)}
                >
                  <View style={styles.languageInfo}>
                    <Text
                      style={[
                        styles.languageName,
                        language.code === lang.code && styles.languageNameActive,
                      ]}
                    >
                      {lang.name}
                    </Text>
                    <Text style={styles.languageRegion}>
                      {lang.region} • {lang.currency}
                    </Text>
                  </View>
                  <View style={styles.currencyContainer}>
                    <Text style={styles.currencySymbol}>{lang.currencySymbol}</Text>
                  </View>
                  {language.code === lang.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#ec4899" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectorText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  currencyBadge: {
    backgroundColor: '#fce7f3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#ec4899',
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
    maxHeight: '80%',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1f2937',
  },
  languageList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  languageItemActive: {
    backgroundColor: '#fdf2f8',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderBottomWidth: 0,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  languageNameActive: {
    color: '#9d174d',
  },
  languageRegion: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  currencyContainer: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
});
