import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { LoadingScreen } from '../src/components/LoadingScreen';
import { useSettings } from '../src/context/SettingsContext';
import { useTheme } from '../src/context/ThemeContext';

const { width } = Dimensions.get('window');

export default function LandingPage() {
  const { user, isLoading, isAuthenticated, login } = useAuth();
  const { t } = useSettings();
  const { theme, fontsLoaded } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || !fontsLoaded) {
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
      {/* Decorative floral pattern overlay */}
      <View style={styles.patternOverlay} />
      
      <View style={styles.header}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoInner}>
            <Ionicons name="heart" size={36} color="#C5A059" />
          </View>
        </View>
        
        {/* Title with serif font */}
        <Text style={styles.title}>{t('landing.title')}</Text>
        <Text style={styles.subtitle}>{t('landing.subtitle')}</Text>
        
        {/* Decorative line */}
        <View style={styles.decorativeLine}>
          <View style={styles.lineLeft} />
          <Ionicons name="diamond" size={12} color="#C5A059" />
          <View style={styles.lineRight} />
        </View>
        
        <Text style={styles.tagline}>{t('landing.description')}</Text>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name={feature.icon as any} size={28} color="#C5A059" />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDesc}>{feature.desc}</Text>
          </View>
        ))}
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={login}>
        <Ionicons name="logo-google" size={22} color="#FFFFFF" style={styles.googleIcon} />
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
    backgroundColor: '#F5F5DC',
  },
  content: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3D2B1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(197, 160, 89, 0.3)',
  },
  title: {
    fontSize: 38,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#3D2B1F',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    color: '#C5A059',
    marginTop: 4,
    letterSpacing: 4,
  },
  decorativeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  lineLeft: {
    width: 50,
    height: 1,
    backgroundColor: '#C5A059',
  },
  lineRight: {
    width: 50,
    height: 1,
    backgroundColor: '#C5A059',
  },
  tagline: {
    fontSize: 15,
    color: '#6B5D52',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
    width: '100%',
  },
  featureCard: {
    width: (width - 72) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#3D2B1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(197, 160, 89, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    color: '#3D2B1F',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 12,
    color: '#9C8B7E',
    textAlign: 'center',
    lineHeight: 16,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C5A059',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    shadowColor: '#3D2B1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 16,
  },
  googleIcon: {
    marginRight: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B5D52',
    fontStyle: 'italic',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 10,
  },
  legalLink: {
    fontSize: 12,
    color: '#C5A059',
    fontWeight: '500',
  },
  legalSeparator: {
    fontSize: 12,
    color: '#D4B87A',
  },
  copyrightText: {
    marginTop: 12,
    marginBottom: 30,
    fontSize: 10,
    color: '#9C8B7E',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 20,
  },
});
