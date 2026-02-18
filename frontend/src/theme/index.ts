// Modern Luxury / Editorial Theme
// MomManager 2026 - Diana-Elena Albu

export const theme = {
  // Background Colors
  colors: {
    // Main backgrounds
    background: '#F5F5DC',        // Bej crem fin
    backgroundAlt: '#FFFDD0',     // Cream
    backgroundLight: '#FAF8F0',   // Cream foarte deschis
    
    // Cards & Surfaces
    card: '#FFFFFF',              // Alb curat
    cardBorder: '#E8E4D9',        // Bej pentru borduri subtile
    
    // Primary Accent (Auriu Satinat)
    primary: '#C5A059',           // Auriu satinat principal
    primaryLight: '#D4B87A',      // Auriu deschis
    primaryDark: '#A68A45',       // Auriu închis
    primaryMuted: 'rgba(197, 160, 89, 0.15)', // Auriu cu opacitate
    
    // Text Colors
    text: '#3D2B1F',              // Maro cafea închis - principal
    textSecondary: '#6B5D52',     // Maro mediu
    textMuted: '#9C8B7E',         // Maro deschis / gri cald
    textLight: '#B8A99A',         // Text foarte deschis
    
    // Semantic Colors (luxury versions)
    success: '#7A9E7E',           // Verde salvie elegant
    successLight: '#E8F0E8',
    warning: '#D4A574',           // Auriu cald
    warningLight: '#FDF6ED',
    error: '#C17A74',             // Roșu teracotă
    errorLight: '#F9EDED',
    info: '#8B9EB3',              // Albastru-gri elegant
    infoLight: '#EEF2F6',
    
    // White for contrast
    white: '#FFFFFF',
    
    // Overlay for pattern
    overlay: 'rgba(245, 245, 220, 0.95)',
  },
  
  // Typography
  fonts: {
    serif: 'PlayfairDisplay_700Bold',      // Pentru titluri
    serifRegular: 'PlayfairDisplay_400Regular',
    serifItalic: 'PlayfairDisplay_400Regular_Italic',
    sans: 'System',                         // Pentru text normal
  },
  
  // Font Sizes
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 26,
    '3xl': 32,
    '4xl': 40,
  },
  
  // Spacing (8pt grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
  },
  
  // Border Radius
  borderRadius: {
    sm: 12,
    md: 16,
    lg: 24,          // Pentru carduri principale
    xl: 32,
    full: 9999,
  },
  
  // Shadows - foarte fine și elegante
  shadows: {
    sm: {
      shadowColor: '#3D2B1F',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#3D2B1F',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 20,
      elevation: 4,
    },
    lg: {
      shadowColor: '#3D2B1F',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 30,
      elevation: 8,
    },
  },
};

// Common card style
export const cardStyle = {
  backgroundColor: theme.colors.card,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing.md,
  ...theme.shadows.md,
};

// Common button style (primary)
export const primaryButtonStyle = {
  backgroundColor: theme.colors.primary,
  borderRadius: theme.borderRadius.md,
  paddingVertical: theme.spacing.md,
  paddingHorizontal: theme.spacing.lg,
  ...theme.shadows.sm,
};

export default theme;
