import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSettings } from '../../src/context/SettingsContext';

export default function PrivacyScreen() {
  const router = useRouter();
  const { t, language } = useSettings();

  const isRomanian = language.code === 'ro';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#9d174d" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isRomanian ? 'Politica de Confidențialitate' : 'Privacy Policy'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>
          {isRomanian ? 'Ultima actualizare: Iunie 2026' : 'Last updated: June 2026'}
        </Text>

        {/* GDPR Badge */}
        <View style={styles.gdprBadge}>
          <Ionicons name="shield-checkmark" size={24} color="#10b981" />
          <Text style={styles.gdprText}>
            {isRomanian ? 'Conform GDPR / UK GDPR' : 'GDPR / UK GDPR Compliant'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isRomanian ? '1. Cine Suntem' : '1. Who We Are'}
          </Text>
          <Text style={styles.sectionText}>
            {isRomanian
              ? 'MomManager 2026 este operat de Diana-Elena Albu, Sole Trader înregistrat în Regatul Unit. Suntem dedicați protejării confidențialității datelor dumneavoastră personale și ale familiei.'
              : 'MomManager 2026 is operated by Diana-Elena Albu, a Sole Trader registered in the United Kingdom. We are dedicated to protecting the privacy of your personal and family data.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isRomanian ? '2. Ce Date Colectăm' : '2. What Data We Collect'}
          </Text>
          <Text style={styles.sectionText}>
            {isRomanian
              ? 'Colectăm următoarele tipuri de date:\n\n• Informații de cont (email, nume, fotografie de profil prin Google)\n• Date de calendar și întâlniri\n• Informații despre bugetul familial\n• Planuri de masă și liste de cumpărături\n• Informații despre copii (nume, date de naștere, activități)\n• Planuri de nutriție și antrenament\n• Conversații cu asistentul AI\n• Imagini de bonuri fiscale (procesate pentru extragere date)'
              : 'We collect the following types of data:\n\n• Account information (email, name, profile picture via Google)\n• Calendar and meeting data\n• Family budget information\n• Meal plans and shopping lists\n• Information about children (names, birth dates, activities)\n• Nutrition and workout plans\n• Conversations with AI assistant\n• Receipt images (processed for data extraction)'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isRomanian ? '3. Cum Folosim Datele' : '3. How We Use Your Data'}
          </Text>
          <Text style={styles.sectionText}>
            {isRomanian
              ? 'Datele dumneavoastră sunt folosite exclusiv pentru:\n\n• Furnizarea și îmbunătățirea serviciilor aplicației\n• Personalizarea recomandărilor AI\n• Sincronizarea datelor între dispozitive\n• Procesarea plăților prin Stripe\n• Comunicări esențiale despre cont\n\nNU folosim datele dumneavoastră pentru publicitate direcționată.'
              : 'Your data is used exclusively for:\n\n• Providing and improving application services\n• Personalizing AI recommendations\n• Syncing data across devices\n• Processing payments through Stripe\n• Essential account communications\n\nWe do NOT use your data for targeted advertising.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isRomanian ? '4. Protecția Datelor' : '4. Data Protection'}
          </Text>
          <View style={styles.protectionBox}>
            <View style={styles.protectionItem}>
              <Ionicons name="lock-closed" size={20} color="#6366f1" />
              <Text style={styles.protectionText}>
                {isRomanian ? 'Criptare în tranzit și în repaus' : 'Encryption in transit and at rest'}
              </Text>
            </View>
            <View style={styles.protectionItem}>
              <Ionicons name="server" size={20} color="#6366f1" />
              <Text style={styles.protectionText}>
                {isRomanian ? 'Servere securizate în UE/UK' : 'Secure servers in EU/UK'}
              </Text>
            </View>
            <View style={styles.protectionItem}>
              <Ionicons name="key" size={20} color="#6366f1" />
              <Text style={styles.protectionText}>
                {isRomanian ? 'Autentificare securizată OAuth 2.0' : 'Secure OAuth 2.0 authentication'}
              </Text>
            </View>
            <View style={styles.protectionItem}>
              <Ionicons name="refresh" size={20} color="#6366f1" />
              <Text style={styles.protectionText}>
                {isRomanian ? 'Backup-uri regulate și securizate' : 'Regular secured backups'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isRomanian ? '5. NU Vindem Datele Dumneavoastră' : '5. We Do NOT Sell Your Data'}
          </Text>
          <View style={styles.importantBox}>
            <Ionicons name="hand-left" size={28} color="#ef4444" />
            <Text style={styles.importantText}>
              {isRomanian
                ? 'GARANTĂM: Nu vindem, nu închiriem și nu partajăm datele dumneavoastră personale cu terțe părți în scopuri de marketing sau comerciale. Datele dumneavoastră vă aparțin și rămân private.'
                : 'WE GUARANTEE: We do not sell, rent, or share your personal data with third parties for marketing or commercial purposes. Your data belongs to you and remains private.'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isRomanian ? '6. Partajarea cu Terți' : '6. Third-Party Sharing'}
          </Text>
          <Text style={styles.sectionText}>
            {isRomanian
              ? 'Partajăm date doar cu:\n\n• Google (autentificare OAuth)\n• Stripe (procesare plăți - doar date de plată)\n• OpenAI (procesare AI - date anonimizate)\n\nToți furnizorii noștri sunt conformi GDPR și au acorduri de procesare a datelor semnate.'
              : 'We only share data with:\n\n• Google (OAuth authentication)\n• Stripe (payment processing - payment data only)\n• OpenAI (AI processing - anonymized data)\n\nAll our providers are GDPR compliant and have signed data processing agreements.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isRomanian ? '7. Drepturile Dumneavoastră (GDPR)' : '7. Your Rights (GDPR)'}
          </Text>
          <Text style={styles.sectionText}>
            {isRomanian
              ? 'Conform GDPR, aveți dreptul la:\n\n• Acces - Să vedeți ce date avem despre dumneavoastră\n• Rectificare - Să corectați datele incorecte\n• Ștergere - Să cereți ștergerea datelor ("dreptul de a fi uitat")\n• Portabilitate - Să exportați datele în format standard\n• Opoziție - Să vă opuneți anumitor prelucrări\n• Retragere consimțământ - În orice moment\n\nPentru a vă exercita drepturile, folosiți funcția "Exportă datele" din Setări sau contactați-ne.'
              : 'Under GDPR, you have the right to:\n\n• Access - See what data we have about you\n• Rectification - Correct inaccurate data\n• Erasure - Request deletion of your data ("right to be forgotten")\n• Portability - Export your data in a standard format\n• Object - Object to certain processing\n• Withdraw consent - At any time\n\nTo exercise your rights, use the "Export Data" function in Settings or contact us.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isRomanian ? '8. Păstrarea Datelor' : '8. Data Retention'}
          </Text>
          <Text style={styles.sectionText}>
            {isRomanian
              ? 'Păstrăm datele dumneavoastră atât timp cât aveți un cont activ. După ștergerea contului, datele sunt eliminate definitiv în termen de 30 de zile, cu excepția cazurilor în care legea ne obligă să le păstrăm.'
              : 'We retain your data as long as you have an active account. After account deletion, data is permanently removed within 30 days, except where law requires us to retain it.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isRomanian ? '9. Datele Copiilor' : '9. Children\'s Data'}
          </Text>
          <Text style={styles.sectionText}>
            {isRomanian
              ? 'Datele despre copii sunt introduse de părinți/tutori și sunt tratate cu maximă confidențialitate. Nu colectăm date direct de la copii. Părinții au control total asupra acestor informații.'
              : 'Data about children is entered by parents/guardians and is treated with maximum confidentiality. We do not collect data directly from children. Parents have full control over this information.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isRomanian ? '10. Contact' : '10. Contact'}
          </Text>
          <Text style={styles.sectionText}>
            {isRomanian
              ? 'Pentru întrebări despre confidențialitate sau pentru a vă exercita drepturile GDPR:\n\nDiana-Elena Albu\nData Controller\nEmail: privacy@mommanager.app\n\nAutoritatea de supraveghere: Information Commissioner\'s Office (ICO), UK'
              : 'For privacy questions or to exercise your GDPR rights:\n\nDiana-Elena Albu\nData Controller\nEmail: privacy@mommanager.app\n\nSupervisory authority: Information Commissioner\'s Office (ICO), UK'}
          </Text>
        </View>

        {/* Copyright Footer */}
        <View style={styles.copyrightContainer}>
          <Text style={styles.copyrightText}>
            © 2026 MomManager by Diana-Elena Albu. All rights reserved. Unauthorized reproduction or distribution of this app's content, code, or design is strictly prohibited.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf2f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fce7f3',
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
    fontSize: 16,
    fontWeight: '700',
    color: '#9d174d',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  lastUpdated: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  gdprBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  gdprText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065f46',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9d174d',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  protectionBox: {
    backgroundColor: '#eef2ff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  protectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  protectionText: {
    fontSize: 14,
    color: '#4338ca',
    flex: 1,
  },
  importantBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: '#fecaca',
  },
  importantText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#991b1b',
    lineHeight: 20,
  },
  copyrightContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#fce7f3',
    marginBottom: 40,
  },
  copyrightText: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
});
