import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { LoadingScreen } from '../src/components/LoadingScreen';
import { useSettings } from '../src/context/SettingsContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Modern 2026 Dark Theme
const C = {
  bg: '#0F0F14',
  bgLight: '#1A1A24',
  card: '#1E1E2A',
  surface: '#252532',
  primary: '#E91E9C',
  primaryGlow: 'rgba(233, 30, 156, 0.15)',
  gold: '#F5A623',
  purple: '#8B5CF6',
  blue: '#3B82F6',
  cyan: '#06B6D4',
  green: '#10B981',
  text: '#FFFFFF',
  textSecondary: '#A1A1B5',
  textMuted: '#6B6B80',
  border: '#2A2A3A',
};

export default function LandingPage() {
  const { user, isLoading, isAuthenticated, login } = useAuth();
  const { t, language } = useSettings();
  const router = useRouter();
  const isRo = language.code === 'ro';

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const features = [
    { icon: 'sparkles', title: 'AI Smart Planner', desc: isRo ? 'Calendar inteligent' : 'Smart calendar', color: C.primary },
    { icon: 'checkbox-outline', title: isRo ? 'Organizare' : 'Organize', desc: isRo ? 'Checklist & buget' : 'Checklists & budget', color: C.blue },
    { icon: 'restaurant-outline', title: isRo ? 'Bucătărie' : 'Kitchen', desc: isRo ? 'Plan mese AI' : 'AI meal planning', color: C.gold },
    { icon: 'book-outline', title: isRo ? 'Povești Copii' : 'Kids Stories', desc: isRo ? 'Povești AI pe vârstă' : 'AI age-based stories', color: C.purple },
    { icon: 'fitness-outline', title: isRo ? 'Exerciții AI' : 'AI Workouts', desc: isRo ? 'Acasă sau sală' : 'Home or gym', color: C.green },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Logo with Glow */}
          <LinearGradient
            colors={['#E91E9C', '#B8157A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBadge}
          >
            <Ionicons name="heart" size={32} color="#FFFFFF" />
          </LinearGradient>
          
          {/* Brand */}
          <Text style={styles.brandText}>MomManager</Text>
          
          {/* Year Badge */}
          <View style={styles.yearBadge}>
            <Text style={styles.yearText}>2 0 2 6</Text>
          </View>
          
          {/* Tagline */}
          <Text style={styles.tagline}>
            {isRo 
              ? 'Ecosistemul complet pentru mamele care lucrează'
              : 'The all-in-one ecosystem for working moms'}
          </Text>
        </View>

        {/* Features Grid - Modern Dark Cards */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionLabel}>
            {isRo ? 'FUNCȚIONALITĂȚI' : 'FEATURES'}
          </Text>
          
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <LinearGradient
                colors={['#252532', '#1E1E2A']}
                style={styles.featureGradient}
              >
                <View style={[styles.featureIconBox, { backgroundColor: `${feature.color}20` }]}>
                  <Ionicons name={feature.icon as any} size={22} color={feature.color} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* AI Badge */}
        <View style={styles.aiBadgeContainer}>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={16} color={C.primary} />
            <Text style={styles.aiBadgeText}>
              {isRo ? 'Powered by AI' : 'Powered by AI'}
            </Text>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity style={styles.loginButton} onPress={login} activeOpacity={0.9}>
            <LinearGradient
              colors={['#E91E9C', '#B8157A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loginGradient}
            >
              <Ionicons name="logo-google" size={22} color="#FFFFFF" />
              <Text style={styles.loginText}>
                {isRo ? 'Continuă cu Google' : 'Continue with Google'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.footerText}>
            {isRo 
              ? '✨ Timpul tău este prețios. Noi te ajutăm să-l gestionezi.'
              : '✨ Your time is precious. We help you manage it.'}
          </Text>
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
          <Text style={styles.copyrightSub}>
            All rights reserved
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
    width: 72,
    height: 72,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#E91E9C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  brandText: {
    fontSize: 36,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
  },
  yearBadge: {
    backgroundColor: C.surface,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: C.primary,
  },
  yearText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 15,
    color: C.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
    maxWidth: 300,
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 2,
    marginBottom: 16,
    paddingLeft: 4,
  },
  featureCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  featureGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: C.text,
    marginBottom: 3,
  },
  featureDesc: {
    fontSize: 13,
    color: C.textMuted,
  },
  aiBadgeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primaryGlow,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  aiBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primary,
  },
  ctaSection: {
    marginBottom: 32,
  },
  loginButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#E91E9C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  loginText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerText: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    marginTop: 18,
    fontStyle: 'italic',
  },
  legalSection: {
    alignItems: 'center',
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  legalLink: {
    fontSize: 13,
    color: C.primary,
    fontWeight: '500',
  },
  legalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.textMuted,
  },
  copyright: {
    fontSize: 12,
    color: C.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  copyrightSub: {
    fontSize: 10,
    color: C.textMuted,
    marginTop: 4,
  },
});
