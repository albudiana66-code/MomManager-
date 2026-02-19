import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { LoadingScreen } from '../src/components/LoadingScreen';
import { useSettings } from '../src/context/SettingsContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Modern 2026 Colors
const C = {
  bg: '#F8F6F3',
  card: '#FFFFFF',
  accent: '#2C2622',
  gold: '#B8956E',
  goldLight: '#D4B896',
  text: '#1A1614',
  textMuted: '#9E958C',
  border: '#E8E4DE',
};

export default function LandingPage() {
  const { user, isLoading, isAuthenticated, login } = useAuth();
  const { t } = useSettings();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const features = [
    { icon: 'sparkles', title: 'AI Smart Planner', desc: t('landing.features.work') },
    { icon: 'wallet-outline', title: t('tabs.organize'), desc: t('landing.features.organize') },
    { icon: 'restaurant-outline', title: t('tabs.kitchen'), desc: t('landing.features.kitchen') },
    { icon: 'people-outline', title: t('tabs.kids'), desc: t('landing.features.kids') },
    { icon: 'heart-outline', title: t('tabs.selfcare'), desc: t('landing.features.selfcare') },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Logo Badge */}
          <View style={styles.logoBadge}>
            <Ionicons name="heart" size={28} color={C.gold} />
          </View>
          
          {/* Brand */}
          <Text style={styles.brandText}>MomManager</Text>
          <View style={styles.yearBadge}>
            <Text style={styles.yearText}>2026</Text>
          </View>
          
          {/* Tagline */}
          <Text style={styles.tagline}>{t('landing.description')}</Text>
        </View>

        {/* Features Grid - Modern Cards */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionLabel}>FEATURES</Text>
          
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <Ionicons name={feature.icon as any} size={22} color={C.gold} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.border} />
            </View>
          ))}
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity style={styles.loginButton} onPress={login} activeOpacity={0.9}>
            <LinearGradient
              colors={['#3D352F', '#2C2622']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loginGradient}
            >
              <Ionicons name="logo-google" size={20} color="#FFFFFF" />
              <Text style={styles.loginText}>{t('auth.continueWithGoogle')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.footerText}>{t('auth.tagline')}</Text>
        </View>

        {/* Legal Footer */}
        <View style={styles.legalSection}>
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => router.push('/legal/terms')}>
              <Text style={styles.legalLink}>Terms</Text>
            </TouchableOpacity>
            <View style={styles.legalDot} />
            <TouchableOpacity onPress={() => router.push('/legal/privacy')}>
              <Text style={styles.legalLink}>Privacy</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.copyright}>
            © 2026 MomManager by Diana-Elena Albu
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: C.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#1A1614',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  brandText: {
    fontSize: 36,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: C.text,
    letterSpacing: -0.5,
  },
  yearBadge: {
    backgroundColor: C.accent,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  yearText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.gold,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 15,
    color: C.textMuted,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
    maxWidth: 280,
  },
  featuresSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 2,
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#1A1614',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(184, 149, 110, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: C.textMuted,
  },
  ctaSection: {
    marginBottom: 32,
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1A1614',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  loginText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerText: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  legalSection: {
    alignItems: 'center',
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  legalLink: {
    fontSize: 13,
    color: C.gold,
    fontWeight: '500',
  },
  legalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
  },
  copyright: {
    fontSize: 11,
    color: C.textMuted,
    textAlign: 'center',
  },
});
