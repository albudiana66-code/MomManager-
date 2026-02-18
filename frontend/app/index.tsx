import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { LoadingScreen } from '../src/components/LoadingScreen';
import { useSettings } from '../src/context/SettingsContext';

const { width } = Dimensions.get('window');

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
    { icon: 'calendar-outline', title: t('tabs.work'), desc: t('landing.features.work') },
    { icon: 'checkbox-outline', title: t('tabs.organize'), desc: t('landing.features.organize') },
    { icon: 'restaurant-outline', title: t('tabs.kitchen'), desc: t('landing.features.kitchen') },
    { icon: 'people-outline', title: t('tabs.kids'), desc: t('landing.features.kids') },
    { icon: 'heart-outline', title: t('tabs.selfcare'), desc: t('landing.features.selfcare') },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="heart" size={48} color="#ec4899" />
        </View>
        <Text style={styles.title}>{t('landing.title')}</Text>
        <Text style={styles.subtitle}>{t('landing.subtitle')}</Text>
        <Text style={styles.tagline}>{t('landing.description')}</Text>
      </View>

      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name={feature.icon as any} size={28} color="#ec4899" />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDesc}>{feature.desc}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={login}>
        <Ionicons name="logo-google" size={24} color="#fff" style={styles.googleIcon} />
        <Text style={styles.loginButtonText}>{t('auth.continueWithGoogle')}</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>{t('auth.tagline')}</Text>
      
      {/* Legal Links */}
      <View style={styles.legalLinks}>
        <TouchableOpacity onPress={() => router.push('/legal/terms')}>
          <Text style={styles.legalLink}>Terms</Text>
        </TouchableOpacity>
        <Text style={styles.legalSeparator}>•</Text>
        <TouchableOpacity onPress={() => router.push('/legal/privacy')}>
          <Text style={styles.legalLink}>Privacy</Text>
        </TouchableOpacity>
      </View>
      
      {/* Copyright */}
      <Text style={styles.copyrightText}>
        © 2026 MomManager by Diana-Elena Albu. All rights reserved.{'\n'}
        Unauthorized reproduction or distribution is strictly prohibited.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf2f8',
  },
  content: {
    padding: 24,
    alignItems: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#9d174d',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#ec4899',
    marginTop: -4,
  },
  tagline: {
    fontSize: 16,
    color: '#be185d',
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 280,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
    maxWidth: 400,
  },
  featureCard: {
    width: width > 400 ? 110 : (width - 72) / 3,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fce7f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9d174d',
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 10,
    color: '#be185d',
    textAlign: 'center',
    marginTop: 2,
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: '#ec4899',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  googleIcon: {
    marginRight: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    fontSize: 14,
    color: '#be185d',
    opacity: 0.7,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
  copyrightText: {
    marginTop: 12,
    marginBottom: 30,
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 20,
  },
});
