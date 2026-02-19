// Quiet Luxury Theme - MomManager 2026
// Diana-Elena Albu

export const theme = {
  colors: {
    // Backgrounds - Bej cald și elegant
    background: '#FAF8F5',         // Bej foarte deschis, cald
    backgroundAlt: '#F5F3EE',      // Bej ușor mai închis
    backgroundMuted: '#EDE9E3',    // Bej neutru
    
    // Cards & Surfaces
    card: '#FFFFFF',               // Alb curat pentru carduri
    cardHover: '#FDFCFA',          // Alb-crem pentru hover
    border: '#E8E4DD',             // Bordură subtilă bej
    
    // Primary - Auriu Satinat (singura culoare de accent)
    primary: '#C5A059',            // Auriu satinat principal
    primaryLight: '#D4B87A',       // Auriu deschis
    primaryDark: '#A68A45',        // Auriu închis
    primaryMuted: 'rgba(197, 160, 89, 0.12)', // Auriu cu opacitate mică
    primarySoft: 'rgba(197, 160, 89, 0.08)',  // Auriu foarte subtil
    
    // Text - Maro cafea elegant
    text: '#3D2B1F',               // Maro cafea - text principal
    textSecondary: '#5C4A3D',      // Maro mediu
    textMuted: '#8B7D70',          // Maro deschis
    textLight: '#A99E92',          // Text foarte deschis
    
    // Status colors - versiuni subtile, elegante
    success: '#8FA68F',            // Verde salvie
    successBg: 'rgba(143, 166, 143, 0.12)',
    warning: '#C5A059',            // Folosim auriul
    warningBg: 'rgba(197, 160, 89, 0.12)',
    error: '#B5807A',              // Roșu teracotă subtil
    errorBg: 'rgba(181, 128, 122, 0.12)',
    
    // Utility
    white: '#FFFFFF',
    overlay: 'rgba(61, 43, 31, 0.4)',
  },
  
  fonts: {
    serif: 'PlayfairDisplay_600SemiBold',
    serifBold: 'PlayfairDisplay_700Bold',
    serifItalic: 'PlayfairDisplay_400Regular_Italic',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  borderRadius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    full: 9999,
  },
  
  shadows: {
    card: {
      shadowColor: '#3D2B1F',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 16,
      elevation: 3,
    },
    button: {
      shadowColor: '#C5A059',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 4,
    },
  },
};

// Stiluri comune pentru carduri
export const cardStyle = {
  backgroundColor: theme.colors.card,
  borderRadius: theme.borderRadius.xl,
  padding: theme.spacing.lg,
  ...theme.shadows.card,
};

// Stiluri pentru butoane principale
export const buttonStyle = {
  backgroundColor: theme.colors.primary,
  borderRadius: theme.borderRadius.md,
  paddingVertical: 14,
  paddingHorizontal: 24,
  ...theme.shadows.button,
};

// Stiluri pentru iconițe în carduri
export const iconContainerStyle = {
  width: 48,
  height: 48,
  borderRadius: 12,
  backgroundColor: theme.colors.primaryMuted,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};

export default theme;
