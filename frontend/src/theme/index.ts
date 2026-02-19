// MomManager 2026 - Modern Luxury Theme
// Sophisticated, Clean, Useful Design

export const theme = {
  colors: {
    // Background - Crem cald elegant, nu plictisitor
    background: '#F8F6F3',
    backgroundDark: '#2C2622',      // Pentru elemente de contrast
    
    // Cards - Alb curat cu profunzime
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    
    // Primary - Auriu Satinat Rich
    primary: '#B8956E',             // Auriu mai cald și bogat
    primaryLight: '#D4B896',
    primaryDark: '#9A7B5A',
    primaryGlow: 'rgba(184, 149, 110, 0.15)',
    
    // Accent - Pentru butoane și acțiuni
    accent: '#2C2622',              // Maro închis elegant
    accentSoft: '#4A433D',
    
    // Text
    text: '#1A1614',                // Aproape negru, cald
    textSecondary: '#6B635B',
    textMuted: '#9E958C',
    textOnDark: '#F8F6F3',
    
    // Borders & Dividers
    border: '#E8E4DE',
    borderLight: '#F0EDE8',
    
    // Status - Subtile dar vizibile
    success: '#6B8E6B',
    error: '#C47D7D',
    
    // Overlay
    overlay: 'rgba(28, 22, 20, 0.6)',
  },
  
  // Gradients pentru butoane moderne
  gradients: {
    primary: ['#C9A77C', '#A08060'],
    dark: ['#3D352F', '#2C2622'],
    card: ['#FFFFFF', '#FAFAF8'],
  },
  
  fonts: {
    heading: 'PlayfairDisplay_600SemiBold',
    headingBold: 'PlayfairDisplay_700Bold',
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
      shadowColor: '#1A1614',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.06,
      shadowRadius: 24,
      elevation: 8,
    },
    medium: {
      shadowColor: '#1A1614',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.1,
      shadowRadius: 32,
      elevation: 12,
    },
    button: {
      shadowColor: '#B8956E',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 10,
    },
  },
};

export default theme;
