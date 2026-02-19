// MomManager 2026 - Ultra Modern Theme
// Dark Elegance with Vibrant Accents

export const theme = {
  colors: {
    // Backgrounds
    background: '#0F0F14',           // Deep dark
    backgroundLight: '#1A1A24',      // Slightly lighter dark
    backgroundCard: '#1E1E2A',       // Card backgrounds
    
    // Primary - Magenta/Pink Accent
    primary: '#E91E9C',              // Vibrant magenta
    primaryLight: '#FF4DB8',
    primaryDark: '#B8157A',
    primaryGlow: 'rgba(233, 30, 156, 0.15)',
    
    // Secondary - Gold/Amber
    gold: '#F5A623',
    goldLight: '#FFD700',
    goldGlow: 'rgba(245, 166, 35, 0.15)',
    
    // Accent Colors
    purple: '#8B5CF6',
    blue: '#3B82F6',
    cyan: '#06B6D4',
    green: '#10B981',
    orange: '#F97316',
    
    // Text
    text: '#FFFFFF',
    textSecondary: '#A1A1B5',
    textMuted: '#6B6B80',
    
    // Borders & Surfaces
    border: '#2A2A3A',
    borderLight: '#3A3A4A',
    surface: '#252532',
    
    // Status
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  
  gradients: {
    primary: ['#E91E9C', '#B8157A'],
    purple: ['#8B5CF6', '#6D28D9'],
    dark: ['#1E1E2A', '#0F0F14'],
    card: ['#252532', '#1E1E2A'],
    gold: ['#F5A623', '#D4920B'],
  },
  
  fonts: {
    heading: 'System',
    headingBold: 'System',
    body: 'System',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
    full: 100,
  },
  
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 8,
    },
    glow: {
      shadowColor: '#E91E9C',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 10,
    },
  },
};

export default theme;
